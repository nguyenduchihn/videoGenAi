import { batch } from "@/api/v1.api";
import { toApiError } from "@/lib/errors";
import type { PortalTask } from "@/types/api";

const POLL_INTERVAL_MS = 3_000;
const MAX_DURATION_MS = 10 * 60 * 1_000;
const MAX_CONSECUTIVE_ERRORS = 5;
const TERMINAL: ReadonlySet<string> = new Set(["succeeded", "failed", "cancelled"]);

export type PollBatchOptions = {
    signal?: AbortSignal;
    /** Gọi khi quá 10 phút mà lô chưa xong: UI báo người dùng xem tiếp ở Lịch sử tác vụ. */
    onExhausted?: () => void;
};

export function isBatchFinished(tasks: PortalTask[]): boolean {
    return tasks.length > 0 && tasks.every((task) => TERMINAL.has(task.status));
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
        }
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}

/** Poll GET /v1/batches/:id mỗi 3 giây tới khi mọi task kết thúc, bị huỷ (signal) hoặc quá 10 phút. */
export async function pollBatch(
    batchId: string,
    onUpdate: (tasks: PortalTask[]) => void,
    options: PollBatchOptions = {},
): Promise<PortalTask[]> {
    const { signal, onExhausted } = options;
    const startedAt = Date.now();
    let last: PortalTask[] = [];
    let consecutiveErrors = 0;

    const sleep = async (ms: number): Promise<boolean> => {
        try {
            await wait(ms, signal);
            return true;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return false;
            throw error;
        }
    };

    while (!signal?.aborted) {
        let tasks: PortalTask[];
        try {
            tasks = (await batch(batchId)).tasks;
            consecutiveErrors = 0;
        } catch (error) {
            if (signal?.aborted) break;
            const apiError = toApiError(error);
            // 4xx (trừ 429) là lỗi chắc chắn (lô không tồn tại, key bị thu hồi…): ném để UI báo.
            if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) throw error;
            consecutiveErrors += 1;
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                onExhausted?.();
                return last;
            }
            // Mạng chập chờn / 5xx / 429: lùi dần 3s → 6s → 12s → 24s, tối đa 30s.
            if (!(await sleep(Math.min(30_000, POLL_INTERVAL_MS * 2 ** (consecutiveErrors - 1))))) break;
            continue;
        }
        if (signal?.aborted) break;
        last = tasks;
        onUpdate(last);
        if (isBatchFinished(last)) return last;
        if (Date.now() - startedAt >= MAX_DURATION_MS) {
            onExhausted?.();
            return last;
        }
        if (!(await sleep(POLL_INTERVAL_MS))) break;
    }
    return last;
}
