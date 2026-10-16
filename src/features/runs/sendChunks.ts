import { toApiError } from "@/lib/errors";
import type { CreateTaskItem, CreateTasksRequest, CreateTasksResponse, EnqueueRunItemsResponse } from "@/types/api";
import { describeApiError } from "../generator/errorCopy";
import { idempotencyKeyOf } from "../generator/idempotency";
import { isChunkOpen, type ManifestChunk, type RunManifest } from "./runManifest";

export const MAX_ITEMS_PER_ENQUEUE = 500;
const RATE_LIMIT_RETRIES = 5;
const DEFAULT_RETRY_AFTER_SEC = 1;

export interface SendDeps {
    createTasks: (payload: CreateTasksRequest, idempotencyKey: string) => Promise<CreateTasksResponse>;
    enqueueRunItems: (runId: string, input: { items: CreateTaskItem[]; runOffset: number }) => Promise<EnqueueRunItemsResponse>;
    /** IMAGE_NOT_FOUND: tải lại ảnh và trả lại toàn bộ task đã dựng lại; null = bỏ cuộc. */
    onImageNotFound?: (imageId: string) => Promise<CreateTaskItem[] | null>;
    save: (manifest: RunManifest) => Promise<void>;
    onProgress?: (manifest: RunManifest) => void;
    sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const withChunk = (manifest: RunManifest, index: number, patch: Partial<ManifestChunk>): RunManifest => ({
    ...manifest,
    chunks: manifest.chunks.map((chunk) => (chunk.index === index ? { ...chunk, ...patch } : chunk)),
});

/** Chunk đang mở từ `fromIndex` trở đi ⇒ xếp hàng hết trên máy chủ (≤ 500 job/request), đánh dấu `queued`. */
async function enqueueRest(manifest: RunManifest, fromIndex: number, deps: SendDeps): Promise<RunManifest> {
    const open = manifest.chunks.filter((chunk) => chunk.index >= fromIndex && isChunkOpen(chunk));
    if (open.length === 0) return manifest;
    const from = open[0]!.from;
    const to = open[open.length - 1]!.to;
    for (let offset = from; offset < to; offset += MAX_ITEMS_PER_ENQUEUE) {
        const slice = manifest.tasks.slice(offset, Math.min(offset + MAX_ITEMS_PER_ENQUEUE, to));
        await withRateLimitRetry(() => deps.enqueueRunItems(manifest.runId, { items: slice, runOffset: offset }), deps.sleep ?? defaultSleep);
    }
    return { ...manifest, chunks: manifest.chunks.map((chunk) => (chunk.index >= fromIndex && isChunkOpen(chunk) ? { ...chunk, state: "queued" as const, error: undefined } : chunk)) };
}

/** 429 RATE_LIMITED (req/s của gói) ⇒ chờ Retry-After rồi thử lại; QUEUE_FULL và lỗi khác ném ra ngoài. */
async function withRateLimitRetry<T>(call: () => Promise<T>, sleep: (ms: number) => Promise<void>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
        try {
            return await call();
        } catch (error) {
            const apiError = toApiError(error);
            if (apiError.status !== 429 || apiError.code === "QUEUE_FULL" || attempt >= RATE_LIMIT_RETRIES) throw error;
            await sleep((apiError.retryAfterSec ?? DEFAULT_RETRY_AFTER_SEC) * 1_000);
        }
    }
}

/**
 * Gửi các chunk còn mở của bản kê, tuần tự. Mỗi chunk một Idempotency-Key suy ra từ (runId, index) ⇒ gửi lại an toàn.
 * - 409 RUN_INDEX_TAKEN: chunk đã có trên máy chủ (tab khác) ⇒ coi là đã gửi.
 * - 429 QUEUE_FULL: phần còn lại xếp hàng trên máy chủ (POST /v1/runs/:id/items) ⇒ tắt tab vẫn chạy.
 * - IMAGE_NOT_FOUND: tải lại ảnh một lần rồi gửi lại chunk.
 * - Lỗi chắc chắn (402, 400…): chunk `failed` kèm lý do, dừng; người dùng bấm "Gửi tiếp" sau khi xử lý.
 */
export async function sendChunks(initial: RunManifest, deps: SendDeps): Promise<RunManifest> {
    let manifest = initial;
    const sleep = deps.sleep ?? defaultSleep;
    let imageRetried = false;
    for (const chunk of initial.chunks) {
        if (!isChunkOpen(chunk)) continue;
        for (;;) {
            try {
                const response = await withRateLimitRetry(
                    () => deps.createTasks({ tasks: manifest.tasks.slice(chunk.from, chunk.to), runId: manifest.runId, runOffset: chunk.from }, idempotencyKeyOf(manifest.runId, `c${chunk.index}`)),
                    sleep,
                );
                manifest = withChunk(manifest, chunk.index, { state: "sent", batchId: response.batchId, error: undefined });
                break;
            } catch (error) {
                const apiError = toApiError(error);
                if (apiError.code === "RUN_INDEX_TAKEN") {
                    manifest = withChunk(manifest, chunk.index, { state: "sent", error: undefined });
                    break;
                }
                if (apiError.status === 429) {
                    manifest = await enqueueRest(manifest, chunk.index, deps);
                    await deps.save(manifest);
                    deps.onProgress?.(manifest);
                    return manifest;
                }
                const imageId = apiError.metadata?.imageId;
                if (apiError.code === "IMAGE_NOT_FOUND" && typeof imageId === "string" && !imageRetried && deps.onImageNotFound) {
                    imageRetried = true;
                    const rebuilt = await deps.onImageNotFound(imageId);
                    if (rebuilt) {
                        manifest = { ...manifest, tasks: rebuilt };
                        continue;
                    }
                }
                manifest = withChunk(manifest, chunk.index, { state: "failed", error: describeApiError(error) });
                await deps.save(manifest);
                deps.onProgress?.(manifest);
                return manifest;
            }
        }
        await deps.save(manifest);
        deps.onProgress?.(manifest);
    }
    return manifest;
}
