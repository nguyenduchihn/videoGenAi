import { useCallback, useEffect, useRef, useState } from "react";
import type { GeneratorResultItem } from "@/components/generator/types";
import { VIDEO_WORKERS } from "@/features/tasks/workerLabels";
import { useFeedback } from "@/hooks/useFeedback";
import { toApiError } from "@/lib/errors";
import { pollBatch } from "@/lib/pollBatch";
import { taskService } from "@/services/task.service";
import { taskStorageService } from "@/services/taskStorage.service";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateTaskItem, CreateTasksResponse, PortalTask } from "@/types/api";
import { describeApiError, describeTaskError, QUEUE_FULL_GIVE_UP } from "./errorCopy";
import { GeneratorError } from "./errors";
import { MAX_TASKS_PER_REQUEST } from "./modes";

const QUEUE_RETRY_LIMIT = 3;
const DEFAULT_RETRY_AFTER_SEC = 10;
const CANCELLED_MESSAGE = "Đã hủy tạo.";
const EXHAUSTED_MESSAGE = "Vẫn đang xử lý, theo dõi tiếp ở Lịch sử tác vụ.";
const NO_BATCH_MESSAGE = "Máy chủ không trả mã lô. Vui lòng kiểm tra Lịch sử tác vụ.";
const NO_TASK_MESSAGE = "Máy chủ không trả dữ liệu task. Vui lòng thử lại.";
const isPlaceholder = (item: GeneratorResultItem) => item.id.startsWith("local:");

export interface QueueNotice {
    seconds: number;
}

export interface SubmitMeta {
    ratio?: string;
    /** IMAGE_NOT_FOUND: tải lại ảnh rồi trả danh sách task đã dựng lại (null = bỏ cuộc). */
    onImageNotFound?: (imageId: string) => Promise<CreateTaskItem[] | null>;
}

export interface UseBatchRunnerReturn {
    results: GeneratorResultItem[];
    /** Đang upload/gửi lô; poll chạy nền nên không khoá nút Tạo quá lâu. */
    isGenerating: boolean;
    queueNotice: QueueNotice | null;
    submit(tasks: CreateTaskItem[], jobs: string[], meta?: SubmitMeta): Promise<void>;
    retry(result: GeneratorResultItem, task: CreateTaskItem, meta?: SubmitMeta): Promise<void>;
    cancel(result: GeneratorResultItem): Promise<void>;
    cancelAll(): Promise<void>;
    download(result: GeneratorResultItem): void;
}

type ResultPatch = Partial<GeneratorResultItem> | ((item: GeneratorResultItem) => GeneratorResultItem);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function mapStatus(status: PortalTask["status"]): GeneratorResultItem["status"] {
    if (status === "succeeded") return "completed";
    if (status === "failed" || status === "cancelled") return "failed";
    if (status === "pending") return "pending";
    return "processing";
}

const resultType = (worker: string): GeneratorResultItem["type"] => (VIDEO_WORKERS.has(worker) ? "video" : "image");

/** Thẻ kết quả bám theo task backend (giữ jobIndex/prompt/ratio của placeholder). */
function fromTask(task: PortalTask, base: Pick<GeneratorResultItem, "jobIndex" | "prompt" | "ratio">): GeneratorResultItem {
    return {
        ...base,
        id: task.id,
        batchId: task.batchId,
        worker: task.worker,
        type: resultType(task.worker),
        status: mapStatus(task.status),
        url: task.result?.url ?? undefined,
        mediaId: task.result?.mediaId,
        upscale: task.result?.upscale?.status,
        error: task.error ? describeTaskError(task.error.code, task.error.message) : undefined,
    };
}

/** Backend chỉ nhận Idempotency-Key 8–128 ký tự [A-Za-z0-9_-]: ghép các phần bằng '-' và lọc ký tự lạ. */
export const idempotencyKeyOf = (...parts: string[]): string =>
    parts.join("-").replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 128).padEnd(8, "0");

const chunkRanges = (count: number, size: number): Array<[number, number]> =>
    Array.from({ length: Math.ceil(count / size) }, (_, i) => [i * size, Math.min((i + 1) * size, count)]);

const isActive = (item: GeneratorResultItem) => item.status === "pending" || item.status === "processing";

export function useBatchRunner(): UseBatchRunnerReturn {
    const { toast } = useFeedback();
    // Giữ toast trong ref: callback/effect bên dưới không phụ thuộc identity của toast (tránh chạy lại restore, nhân poller).
    const toastRef = useRef(toast);
    useEffect(() => { toastRef.current = toast; }, [toast]);
    const [results, setResults] = useState<GeneratorResultItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [queueNotice, setQueueNotice] = useState<QueueNotice | null>(null);
    const pollControllers = useRef(new Map<string, AbortController>());
    const idempotencyKeys = useRef(new Map<string, string>());
    /** "Huỷ cả lô" bấm khi còn chunk chưa gửi ⇒ dừng gửi tiếp. */
    const cancelRequested = useRef(false);
    const userId = useAuthStore((s) => s.user?.user.id ?? "");
    const userIdRef = useRef(userId);
    useEffect(() => { userIdRef.current = userId; }, [userId]);

    useEffect(() => {
        const controllers = pollControllers.current;
        return () => {
            controllers.forEach((c) => c.abort());
            controllers.clear();
        };
    }, []);

    const patchWhere = useCallback((match: (item: GeneratorResultItem) => boolean, patch: ResultPatch) => {
        setResults((current) =>
            current.map((item) => (match(item) ? (typeof patch === "function" ? patch(item) : { ...item, ...patch }) : item)),
        );
    }, []);

    const applyTasks = useCallback((tasks: PortalTask[]) => {
        const byId = new Map(tasks.map((task) => [task.id, task]));
        patchWhere((item) => byId.has(item.id), (item) => fromTask(byId.get(item.id)!, item));
    }, [patchWhere]);

    /** Poll một lô tới khi xong (mỗi lô chỉ một poller); lô hết hạn/không tồn tại ⇒ bỏ khỏi localStorage. */
    const trackBatch = useCallback(async (batchId: string): Promise<void> => {
        if (pollControllers.current.has(batchId)) return;
        const controller = new AbortController();
        pollControllers.current.set(batchId, controller);
        let exhausted = false;
        try {
            await pollBatch(batchId, applyTasks, {
                signal: controller.signal,
                onExhausted: () => {
                    exhausted = true;
                    toastRef.current.warning(EXHAUSTED_MESSAGE);
                },
            });
            if (!exhausted && !controller.signal.aborted) taskStorageService.removeBatch(userIdRef.current, batchId);
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            const apiError = toApiError(error);
            if (apiError.status === 404) taskStorageService.removeBatch(userIdRef.current, batchId);
            patchWhere((item) => item.batchId === batchId && isActive(item), { status: "failed", error: describeApiError(error) });
        } finally {
            if (pollControllers.current.get(batchId) === controller) pollControllers.current.delete(batchId);
        }
    }, [applyTasks, patchWhere]);

    useEffect(() => {
        let cancelled = false;
        const restore = async () => {
            if (!userId) return;
            for (const stored of taskStorageService.getBatches(userId)) {
                if (cancelled) return;
                try {
                    const { tasks } = await taskService.getBatch(stored.batchId);
                    if (cancelled) return;
                    setResults((current) => {
                        const known = new Set(current.map((item) => item.id));
                        const restored = tasks
                            .filter((task) => !known.has(task.id))
                            .map((task, index) => {
                                const position = stored.taskIds.indexOf(task.id);
                                const jobIndex = position >= 0 ? position + 1 : index + 1;
                                return fromTask(task, { jobIndex, prompt: stored.prompts[position] ?? `Job ${jobIndex}` });
                            });
                        return [...current, ...restored].sort((a, b) => a.jobIndex - b.jobIndex);
                    });
                    if (tasks.some((task) => task.status === "pending" || task.status === "processing")) void trackBatch(stored.batchId);
                } catch (error) {
                    if (toApiError(error).status === 404) taskStorageService.removeBatch(userId, stored.batchId);
                    else console.error(`Không thể khôi phục lô ${stored.batchId}:`, error);
                }
            }
        };
        void restore();
        return () => { cancelled = true; };
    }, [userId, trackBatch]);

    const waitRetryAfter = useCallback(async (seconds: number) => {
        for (let left = seconds; left > 0; left -= 1) {
            setQueueNotice({ seconds: left });
            await sleep(1_000);
        }
        setQueueNotice(null);
    }, []);

    /** Gửi một lô ≤ 20 task: 429 ⇒ chờ Retry-After rồi gửi lại cùng key (≤ 3 lần); IMAGE_NOT_FOUND ⇒ tải lại ảnh một lần. */
    const createWithRetry = useCallback(async (
        tasks: CreateTaskItem[],
        key: string,
        meta: SubmitMeta,
        range: [number, number],
    ): Promise<CreateTasksResponse> => {
        let items = tasks;
        let queueRetries = 0;
        let imageRetried = false;
        for (;;) {
            try {
                return await taskService.createTasks({ tasks: items }, key);
            } catch (error) {
                const apiError = toApiError(error);
                if (apiError.status === 429 && queueRetries < QUEUE_RETRY_LIMIT) {
                    queueRetries += 1;
                    await waitRetryAfter(apiError.retryAfterSec ?? DEFAULT_RETRY_AFTER_SEC);
                    continue;
                }
                const imageId = apiError.metadata?.imageId;
                if (apiError.code === "IMAGE_NOT_FOUND" && typeof imageId === "string" && !imageRetried && meta.onImageNotFound) {
                    imageRetried = true;
                    const rebuilt = await meta.onImageNotFound(imageId);
                    if (rebuilt) {
                        items = rebuilt.slice(range[0], range[1]);
                        continue;
                    }
                }
                throw error;
            }
        }
    }, [waitRetryAfter]);

    const submit = useCallback(async (tasks: CreateTaskItem[], jobs: string[], meta: SubmitMeta = {}): Promise<void> => {
        if (tasks.length === 0) return;
        setIsGenerating(true);
        cancelRequested.current = false;
        const contentKey = JSON.stringify(tasks);
        const baseKey = idempotencyKeys.current.get(contentKey) ?? crypto.randomUUID();
        idempotencyKeys.current.set(contentKey, baseKey);

        const placeholderIds = tasks.map((_, index) => `local:${baseKey}:${index}`);
        setResults((current) => [
            ...current,
            ...tasks.map((task, index): GeneratorResultItem => ({
                id: placeholderIds[index]!,
                jobIndex: current.length + index + 1,
                prompt: jobs[index] ?? String(task.params.prompt ?? ""),
                status: "pending",
                type: resultType(task.worker),
                worker: task.worker,
                ratio: meta.ratio,
            })),
        ]);

        const pollers: Promise<void>[] = [];
        let failure: string | null = null;
        try {
            for (const [index, [start, end]] of chunkRanges(tasks.length, MAX_TASKS_PER_REQUEST).entries()) {
                const chunkIds = new Set(placeholderIds.slice(start, end));
                if (cancelRequested.current) failure ??= CANCELLED_MESSAGE;
                if (failure) {
                    patchWhere((item) => chunkIds.has(item.id), { status: "failed", error: failure });
                    continue;
                }
                try {
                    const response = await createWithRetry(tasks.slice(start, end), idempotencyKeyOf(baseKey, `c${index}`), meta, [start, end]);
                    const created = response.tasks;
                    const order = placeholderIds.slice(start, end);
                    patchWhere((item) => chunkIds.has(item.id), (item) => {
                        const task = created[order.indexOf(item.id)];
                        return task ? fromTask(task, item) : item;
                    });
                    if (response.batchId) {
                        taskStorageService.saveBatch(userIdRef.current, response.batchId, created.map((t) => t.id), jobs.slice(start, end));
                        pollers.push(trackBatch(response.batchId));
                    } else {
                        console.error("[generator] server returned no batchId for chunk", start, end);
                        patchWhere((item) => chunkIds.has(item.id) && isPlaceholder(item), { status: "failed", error: NO_BATCH_MESSAGE });
                    }
                } catch (error) {
                    const apiError = toApiError(error);
                    failure = apiError.status === 429 ? QUEUE_FULL_GIVE_UP : describeApiError(error);
                    // 429 giữ key để lần gửi lại cùng nội dung không tạo trùng; lỗi khác là kết luận ⇒ bỏ key.
                    if (apiError.status !== 429) idempotencyKeys.current.delete(contentKey);
                    patchWhere((item) => chunkIds.has(item.id), { status: "failed", error: failure });
                }
            }
            if (!failure) idempotencyKeys.current.delete(contentKey);
        } finally {
            setIsGenerating(false);
        }
        await Promise.all(pollers);
    }, [createWithRetry, patchWhere, trackBatch]);

    const retry = useCallback(async (result: GeneratorResultItem, task: CreateTaskItem, meta: SubmitMeta = {}): Promise<void> => {
        patchWhere((item) => item.id === result.id, { status: "pending", error: undefined });
        const retryKey = `retry:${result.id}`;
        const key = idempotencyKeys.current.get(retryKey) ?? idempotencyKeyOf("retry", result.id, crypto.randomUUID());
        idempotencyKeys.current.set(retryKey, key);
        try {
            const response = await createWithRetry([task], key, meta, [0, 1]);
            const created = response.tasks[0];
            if (!created) throw new GeneratorError("TASK_MISSING", NO_TASK_MESSAGE);
            idempotencyKeys.current.delete(retryKey);
            patchWhere((item) => item.id === result.id, (item) => fromTask(created, item));
            taskStorageService.saveBatch(userIdRef.current, response.batchId, [created.id], [result.prompt]);
            await trackBatch(response.batchId);
        } catch (error) {
            const message = toApiError(error).status === 429 ? QUEUE_FULL_GIVE_UP : describeApiError(error);
            patchWhere((item) => item.id === result.id, { status: "failed", error: message });
        }
    }, [createWithRetry, patchWhere, trackBatch]);

    const cancel = useCallback(async (result: GeneratorResultItem): Promise<void> => {
        if (!result.id || result.id.startsWith("local:")) return;
        try {
            await taskService.cancelTask(result.id);
            patchWhere((item) => item.id === result.id, { status: "failed", error: CANCELLED_MESSAGE });
        } catch (error) {
            patchWhere((item) => item.id === result.id, { error: describeApiError(error) });
        }
    }, [patchWhere]);

    const cancelAll = useCallback(async (): Promise<void> => {
        cancelRequested.current = true;
        patchWhere((item) => isPlaceholder(item) && isActive(item), { status: "failed", error: CANCELLED_MESSAGE });
        const batchIds = [...new Set(results.filter(isActive).map((item) => item.batchId).filter((id): id is string => Boolean(id)))];
        const settled = await Promise.allSettled(batchIds.map((batchId) => taskService.cancelBatch(batchId)));
        const cancelledIds = new Set(
            settled.flatMap((outcome) => (outcome.status === "fulfilled" ? outcome.value.cancelled.map((task) => task.id) : [])),
        );
        patchWhere((item) => cancelledIds.has(item.id), { status: "failed", error: CANCELLED_MESSAGE });
        const firstFailure = settled.find((outcome): outcome is PromiseRejectedResult => outcome.status === "rejected");
        if (firstFailure) toastRef.current.error(describeApiError(firstFailure.reason));
    }, [patchWhere, results]);

    const download = useCallback((result: GeneratorResultItem): void => {
        if (!result.url) {
            toastRef.current.warning(`Job #${result.jobIndex} chưa có file kết quả để tải.`);
            return;
        }
        window.open(result.url, "_blank", "noopener");
    }, []);

    return { results, isGenerating, queueNotice, submit, retry, cancel, cancelAll, download };
}
