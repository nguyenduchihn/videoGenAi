import { useState, useRef, useEffect } from "react";
import { taskService } from "@/services/task.service";
import { imageService } from "@/services/image.service";
import { taskStorageService } from "@/services/taskStorage.service";
import { pollBatch } from "@/lib/pollBatch";
import { useApiKeyStore } from "@/stores/apiKey.store";
import { useAuthStore } from "@/stores/auth.store";
import { useFeedback } from "@/hooks/useFeedback";
import {
    getGeneratorErrorMessage,
    getTaskErrorMessage,
} from "@/components/generator/ultils/generatorHelpers";
import type { GeneratorResultItem } from "@/components/generator/generatorResult";
import type { GeneratorFilesState, GeneratorMode } from "@/components/generator/types";
import type { CreateTaskItem } from "@/types/api";
import type { UploadedIds } from "./buildTasks";

function mapStatus(s: string): GeneratorResultItem["status"] {
    if (s === "succeeded") return "completed";
    if (s === "failed" || s === "cancelled") return "failed";
    if (s === "pending") return "pending";
    return "processing";
}

export interface UseBatchRunnerReturn {
    results: GeneratorResultItem[];
    isGenerating: boolean;
    submit(
        jobs: string[],
        buildFn: (ids: UploadedIds) => CreateTaskItem[],
        opts: { mode: GeneratorMode; modelKey: string; files: GeneratorFilesState; estimatedCredits: number },
    ): Promise<void>;
    retry(
        result: GeneratorResultItem,
        buildFn: (ids: UploadedIds) => CreateTaskItem,
        opts: { mode: GeneratorMode; files: GeneratorFilesState },
    ): Promise<void>;
    cancel(result: GeneratorResultItem): Promise<void>;
    download(result: GeneratorResultItem): void;
}

export function useBatchRunner(): UseBatchRunnerReturn {
    const { toast } = useFeedback();
    const [results, setResults] = useState<GeneratorResultItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const activePollControllers = useRef(new Map<string, AbortController>());
    const idempotencyKeysRef = useRef(new Map<string, string>());
    const userId = useAuthStore((s) => s.user?.user.id ?? "");
    const userIdRef = useRef(userId);
    useEffect(() => {
        userIdRef.current = userId;
    }, [userId]);

    useEffect(() => {
        const controllers = activePollControllers.current;
        return () => {
            controllers.forEach((c) => c.abort());
            controllers.clear();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const abortControllers = new Map<string, AbortController>();

        const restoreBatches = async () => {
            if (!userId) return;
            const batches = taskStorageService.getBatches(userId);
            for (const batch of batches) {
                if (cancelled) return;
                try {
                    const response = await taskService.getBatch(batch.batchId);
                    if (cancelled) return;

                    const restoredResults: GeneratorResultItem[] = response.tasks.map((task, index) => ({
                        id: task.id,
                        batchId: task.batchId,
                        jobIndex: batch.taskIds.indexOf(task.id) >= 0
                            ? batch.taskIds.indexOf(task.id) + 1
                            : index + 1,
                        prompt: batch.prompts[index] ?? `Video ${index + 1}`,
                        status: mapStatus(task.status),
                        type: "video" as const,
                        url: task.result?.url ?? undefined,
                        error: task.error ? getTaskErrorMessage(task.error.code, task.error.message) : undefined,
                    }));

                    setResults((cur) => {
                        const map = new Map(cur.map((item) => [item.id, item]));
                        for (const r of restoredResults) {
                            const prev = map.get(r.id);
                            map.set(r.id, { ...prev, ...r });
                        }
                        return Array.from(map.values()).sort((a, b) => a.jobIndex - b.jobIndex);
                    });

                    const unfinished = response.tasks.filter(
                        (t) => t.status === "pending" || t.status === "processing",
                    );
                    if (unfinished.length > 0) {
                        const controller = new AbortController();
                        abortControllers.set(batch.batchId, controller);
                        void pollBatch(
                            batch.batchId,
                            (latestTasks) => {
                                if (cancelled) return;
                                setResults((cur) => {
                                    const map = new Map(cur.map((item) => [item.id, item]));
                                    latestTasks.forEach((task, index) => {
                                        const prev = map.get(task.id);
                                        const restoredPrompt =
                                            batch.prompts[batch.taskIds.indexOf(task.id)] ?? `Video ${index + 1}`;
                                        map.set(task.id, {
                                            ...prev,
                                            id: task.id,
                                            batchId: task.batchId,
                                            jobIndex: batch.taskIds.indexOf(task.id) + 1 || index + 1,
                                            prompt: prev?.prompt || restoredPrompt,
                                            status: mapStatus(task.status),
                                            type: "video" as const,
                                            url: task.result?.url ?? undefined,
                                            error: task.error
                                                ? getTaskErrorMessage(task.error.code, task.error.message)
                                                : undefined,
                                        });
                                    });
                                    return Array.from(map.values());
                                });
                            },
                            { signal: controller.signal },
                        ).catch((error) => {
                            if ((error as Error).name !== "AbortError") {
                                console.error(`Không thể tiếp tục polling batch ${batch.batchId}:`, error);
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Không thể khôi phục batch ${batch.batchId}:`, error);
                }
            }
        };

        void restoreBatches();
        return () => {
            cancelled = true;
            abortControllers.forEach((c) => c.abort());
            abortControllers.clear();
        };
    }, [userId]);

    const submit = async (
        jobs: string[],
        buildFn: (ids: UploadedIds) => CreateTaskItem[],
        opts: { mode: GeneratorMode; modelKey: string; files: GeneratorFilesState; estimatedCredits: number },
    ): Promise<void> => {
        if (opts.estimatedCredits <= 0) return;
        if (jobs.length > 20) {
            setResults((cur) => [...cur, {
                id: `limit-${Date.now()}`,
                jobIndex: cur.length + 1,
                prompt: "",
                status: "failed" as const,
                type: opts.mode === "text-to-image" || opts.mode === "batch-image" ? "image" : "video",
                error: "Mỗi lần chỉ được tạo tối đa 20 task.",
            }]);
            return;
        }
        if (!useApiKeyStore.getState().key?.raw) {
            useApiKeyStore.getState().openConnectDialog();
            return;
        }

        setIsGenerating(true);
        const jobsKey = jobs.join("\0") + "\0" + opts.mode + "\0" + opts.modelKey;
        let iKey = idempotencyKeysRef.current.get(jobsKey);
        if (!iKey) { iKey = crypto.randomUUID(); idempotencyKeysRef.current.set(jobsKey, iKey); }

        const newResults: GeneratorResultItem[] = jobs.map((job, index) => ({
            id: `${Date.now()}-${index}`,
            jobIndex: index + 1,
            prompt: job,
            status: "processing" as const,
            type: opts.mode === "text-to-image" || opts.mode === "batch-image" ? "image" : "video",
        }));
        setResults((cur) => [...cur, ...newResults]);

        let createdTaskIds = new Set<string>();
        let pollingCancelled = false;
        try {
            let startImageId: string | undefined;
            let endImageId: string | undefined;
            if (opts.mode === "image-to-video") {
                if (opts.files.startFrame[0]) startImageId = await imageService.uploadImage(opts.files.startFrame[0]);
                if (opts.files.endFrame[0]) endImageId = await imageService.uploadImage(opts.files.endFrame[0]);
            }

            const tasks = buildFn({ startImageId, endImageId });
            const response = await taskService.createTasks({ tasks }, iKey);
            idempotencyKeysRef.current.delete(jobsKey);

            createdTaskIds = new Set(
                response.tasks.map((t) => t.id).filter((id): id is string => Boolean(id)),
            );
            if (response.batchId) {
                taskStorageService.saveBatch(
                    userIdRef.current,
                    response.batchId,
                    response.tasks.map((t) => t.id).filter((id): id is string => Boolean(id)),
                    jobs,
                );
            }

            setResults((cur) =>
                cur.map((item) => {
                    const localIndex = newResults.findIndex((n) => n.id === item.id);
                    if (localIndex === -1) return item;
                    const task = response.tasks[localIndex];
                    if (!task?.id) return item;
                    return {
                        ...item,
                        id: task.id,
                        batchId: response.batchId,
                        jobIndex: cur.findIndex((c) => c.id === item.id) + 1,
                        status: "processing" as const,
                    };
                }),
            );

            if (response.batchId) {
                const controller = new AbortController();
                activePollControllers.current.set(response.batchId, controller);
                try {
                    let pollingExhausted = false;
                    await pollBatch(
                        response.batchId,
                        (pollTasks) => {
                            setResults((cur) =>
                                cur.map((item) => {
                                    const task = pollTasks.find((t) => t.id === item.id);
                                    if (!task) return item;
                                    return {
                                        ...item,
                                        batchId: task.batchId,
                                        status: mapStatus(task.status),
                                        url: task.result?.url ?? undefined,
                                        error: task.error
                                            ? getTaskErrorMessage(task.error.code, task.error.message)
                                            : undefined,
                                    };
                                }),
                            );
                        },
                        {
                            signal: controller.signal,
                            onExhausted: () => {
                                pollingExhausted = true;
                                toast.warning("Tác vụ vẫn đang xử lý, xem tiếp ở Lịch sử tác vụ.");
                            },
                        },
                    );
                    if (!pollingExhausted) taskStorageService.removeBatch(userIdRef.current, response.batchId);
                } finally {
                    pollingCancelled = controller.signal.aborted;
                    if (activePollControllers.current.get(response.batchId) === controller) {
                        activePollControllers.current.delete(response.batchId);
                    }
                }
            }
        } catch (error) {
            if (pollingCancelled || (error instanceof Error && error.name === "AbortError")) return;
            console.error("Generator error:", error);
            const message = getGeneratorErrorMessage(error);
            const newResultIds = new Set(newResults.map((n) => n.id));
            setResults((cur) =>
                cur.map((item) => {
                    if (!newResultIds.has(item.id) && !createdTaskIds.has(item.id)) return item;
                    return { ...item, status: "failed" as const, error: message };
                }),
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const retry = async (
        result: GeneratorResultItem,
        buildFn: (ids: UploadedIds) => CreateTaskItem,
        opts: { mode: GeneratorMode; files: GeneratorFilesState },
    ): Promise<void> => {
        setResults((cur) =>
            cur.map((item) =>
                item.id === result.id ? { ...item, status: "processing" as const, error: undefined } : item,
            ),
        );
        try {
            let startImageId: string | undefined;
            let endImageId: string | undefined;
            if (opts.mode === "image-to-video") {
                if (opts.files.startFrame[0]) startImageId = await imageService.uploadImage(opts.files.startFrame[0]);
                if (opts.files.endFrame[0]) endImageId = await imageService.uploadImage(opts.files.endFrame[0]);
            }

            const task = buildFn({ startImageId, endImageId });
            const retryKey = `retry\0${result.id}\0${opts.mode}`;
            let retryIKey = idempotencyKeysRef.current.get(retryKey);
            if (!retryIKey) { retryIKey = crypto.randomUUID(); idempotencyKeysRef.current.set(retryKey, retryIKey); }

            const response = await taskService.createTasks({ tasks: [task] }, retryIKey);
            idempotencyKeysRef.current.delete(retryKey);

            if (response.batchId) {
                taskStorageService.saveBatch(
                    userIdRef.current,
                    response.batchId,
                    response.tasks.map((t) => t.id).filter((id): id is string => Boolean(id)),
                    [result.prompt],
                );
            }

            const newTaskId = response.tasks[0]?.id;
            setResults((cur) =>
                cur.map((item) =>
                    item.id === result.id
                        ? { ...item, id: newTaskId ?? item.id, status: "processing" as const }
                        : item,
                ),
            );

            if (!response.batchId) throw new Error("BATCH_ID_MISSING");

            await pollBatch(
                response.batchId,
                (pollTasks) => {
                    const taskResult = pollTasks[0];
                    if (!taskResult) return;
                    setResults((cur) =>
                        cur.map((item) =>
                            item.id === result.id || item.id === newTaskId
                                ? {
                                    ...item,
                                    id: taskResult.id,
                                    batchId: taskResult.batchId,
                                    status: mapStatus(taskResult.status),
                                    url: taskResult.result?.url ?? undefined,
                                    error: taskResult.error?.message ?? undefined,
                                }
                                : item,
                        ),
                    );
                },
                {},
            );
            taskStorageService.removeBatch(userIdRef.current, response.batchId);
        } catch (error) {
            console.error("Retry generator error:", error);
            const message = getGeneratorErrorMessage(error);
            setResults((cur) =>
                cur.map((item) =>
                    item.id === result.id ? { ...item, status: "failed" as const, error: message } : item,
                ),
            );
        }
    };

    const cancel = async (result: GeneratorResultItem): Promise<void> => {
        try {
            if (!result.id) return;
            await taskService.cancelTask(result.id);
            setResults((cur) =>
                cur.map((item) =>
                    item.id === result.id
                        ? { ...item, status: "failed" as const, error: "Đã hủy tạo." }
                        : item,
                ),
            );
        } catch (error) {
            console.error("Cancel task failed:", error);
            setResults((cur) =>
                cur.map((item) =>
                    item.id === result.id
                        ? { ...item, error: error instanceof Error ? error.message : "Không thể hủy tác vụ." }
                        : item,
                ),
            );
        }
    };

    const download = (result: GeneratorResultItem): void => {
        if (!result.url) {
            toast.warning(`Job #${result.jobIndex} chưa có file kết quả để tải.`);
            return;
        }
        window.open(result.url, "_blank", "noopener");
    };

    return { results, isGenerating, submit, retry, cancel, download };
}
