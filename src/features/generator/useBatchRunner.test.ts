import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/errors";
import type { CreateTaskItem, PortalTask } from "@/types/api";
import { useBatchRunner } from "./useBatchRunner";

vi.mock("@/services/task.service", () => ({
    taskService: { createTasks: vi.fn(), getBatch: vi.fn(), cancelTask: vi.fn(), cancelBatch: vi.fn() },
}));
vi.mock("@/lib/pollBatch", () => ({ pollBatch: vi.fn(), isBatchFinished: vi.fn() }));
vi.mock("@/services/taskStorage.service", () => ({
    taskStorageService: { getBatches: vi.fn(() => []), saveBatch: vi.fn(), removeBatch: vi.fn() },
}));
vi.mock("@/stores/auth.store", () => ({
    useAuthStore: (selector: (state: { user: { user: { id: string } } }) => unknown) =>
        selector({ user: { user: { id: "user-1" } } }),
}));
const toast = { warning: vi.fn(), error: vi.fn(), success: vi.fn(), info: vi.fn() };
vi.mock("@/hooks/useFeedback", () => ({ useFeedback: () => ({ toast }) }));

import { pollBatch } from "@/lib/pollBatch";
import { taskService } from "@/services/task.service";
import { taskStorageService } from "@/services/taskStorage.service";

const task = (patch: Partial<PortalTask> = {}): PortalTask => ({
    id: "task-1",
    batchId: "batch-1",
    status: "pending",
    stage: "generate",
    worker: "text-to-video",
    model: null,
    priceCredits: 5,
    result: null,
    error: null,
    creditsRefunded: 0,
    createdAt: "",
    updatedAt: "",
    completedAt: null,
    ...patch,
});
const item = (prompt: string, worker: CreateTaskItem["worker"] = "text-to-video"): CreateTaskItem => ({ worker, params: { prompt } });

/** createTasks giả: trả đúng số task theo body, id theo thứ tự toàn cục. */
function mockCreateSequential() {
    let seq = 0;
    vi.mocked(taskService.createTasks).mockImplementation(async ({ tasks }, key) => {
        const batchId = `batch-${key}`;
        return {
            batchId,
            totalCredits: tasks.length * 5,
            tasks: tasks.map((t) => task({ id: `t${++seq}`, batchId, worker: t.worker })),
        };
    });
}

describe("useBatchRunner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(taskStorageService.getBatches).mockReturnValue([]);
        vi.mocked(pollBatch).mockResolvedValue([]);
    });

    it("submit stores the batch, maps results to tasks and removes the batch once polling finishes", async () => {
        vi.mocked(taskService.createTasks).mockResolvedValue({ batchId: "batch-1", totalCredits: 5, tasks: [task()] });
        vi.mocked(pollBatch).mockImplementation(async (_id, onUpdate) => {
            onUpdate([task({ status: "succeeded", result: { mediaId: "m1", url: "https://example.com/v.mp4" } })]);
            return [];
        });
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => {
            await result.current.submit([item("test prompt")], ["test prompt"], { ratio: "16:9" });
        });

        expect(taskStorageService.saveBatch).toHaveBeenCalledWith("user-1", "batch-1", ["task-1"], ["test prompt"]);
        const completed = result.current.results.find((r) => r.status === "completed");
        expect(completed).toMatchObject({ id: "task-1", url: "https://example.com/v.mp4", mediaId: "m1", type: "video", worker: "text-to-video", ratio: "16:9", jobIndex: 1 });
        expect(taskStorageService.removeBatch).toHaveBeenCalledWith("user-1", "batch-1");
        expect(result.current.isGenerating).toBe(false);
    });

    it("onExhausted keeps the batch stored and warns the user", async () => {
        vi.mocked(taskService.createTasks).mockResolvedValue({ batchId: "batch-2", totalCredits: 5, tasks: [task({ batchId: "batch-2" })] });
        vi.mocked(pollBatch).mockImplementation(async (_id, _onUpdate, opts) => { opts?.onExhausted?.(); return []; });
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit([item("p")], ["p"]); });

        expect(taskStorageService.removeBatch).not.toHaveBeenCalled();
        expect(toast.warning).toHaveBeenCalled();
    });

    it("splits 45 tasks into 3 requests of ≤20 with suffixed idempotency keys and one batch each", async () => {
        mockCreateSequential();
        const jobs = Array.from({ length: 45 }, (_, i) => `p${i + 1}`);
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit(jobs.map((p) => item(p)), jobs); });

        const calls = vi.mocked(taskService.createTasks).mock.calls;
        expect(calls.map(([body]) => body.tasks.length)).toEqual([20, 20, 5]);
        const keys = calls.map(([, key]) => key);
        expect(keys.map((k) => k?.split(":").at(-1))).toEqual(["0", "1", "2"]);
        expect(new Set(keys.map((k) => k?.split(":")[0])).size).toBe(1);
        expect(pollBatch).toHaveBeenCalledTimes(3);
        expect(result.current.results).toHaveLength(45);
        expect(result.current.results[44]).toMatchObject({ id: "t45", jobIndex: 45, prompt: "p45" });
    });

    it("429 waits Retry-After and resends the same chunk with the same key", async () => {
        const create = vi.mocked(taskService.createTasks);
        create
            .mockRejectedValueOnce(new ApiError(429, "QUEUE_FULL", "full", "r", { retryAfterSec: 0 }))
            .mockResolvedValueOnce({ batchId: "batch-1", totalCredits: 5, tasks: [task()] });
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit([item("p")], ["p"]); });

        expect(create).toHaveBeenCalledTimes(2);
        expect(create.mock.calls[0]?.[1]).toBe(create.mock.calls[1]?.[1]);
        expect(result.current.results[0]?.status).not.toBe("failed");
        expect(result.current.queueNotice).toBeNull();
    });

    it("gives up after 3 queue retries and marks the chunk failed with the overload copy", async () => {
        vi.mocked(taskService.createTasks).mockRejectedValue(new ApiError(429, "QUEUE_FULL", "full", "r", { retryAfterSec: 0 }));
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit([item("p")], ["p"]); });

        expect(taskService.createTasks).toHaveBeenCalledTimes(4);
        expect(result.current.results[0]).toMatchObject({ status: "failed", error: "Hệ thống đang quá tải, vui lòng thử lại sau." });
    });

    it("IMAGE_NOT_FOUND re-uploads once via onImageNotFound and resends the rebuilt chunk", async () => {
        const create = vi.mocked(taskService.createTasks);
        create
            .mockRejectedValueOnce(new ApiError(400, "IMAGE_NOT_FOUND", "gone", "r", { metadata: { imageId: "old", ttlHours: 24 } }))
            .mockResolvedValueOnce({ batchId: "batch-1", totalCredits: 5, tasks: [task({ worker: "image-to-video" })] });
        const rebuilt: CreateTaskItem[] = [{ worker: "image-to-video", params: { prompt: "p" }, images: { start: "new" } }];
        const onImageNotFound = vi.fn(async () => rebuilt);
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => {
            await result.current.submit([{ worker: "image-to-video", params: { prompt: "p" }, images: { start: "old" } }], ["p"], { onImageNotFound });
        });

        expect(onImageNotFound).toHaveBeenCalledWith("old");
        expect(create.mock.calls[1]?.[0].tasks).toEqual(rebuilt);
        expect(result.current.results[0]).toMatchObject({ type: "video", status: "pending" });
    });

    it("a non-retryable error fails the chunk with Vietnamese copy and skips the remaining chunks", async () => {
        vi.mocked(taskService.createTasks).mockRejectedValue(
            new ApiError(400, "BAD_IMAGE_INPUTS", "raw", "r", { metadata: { field: "images.start", constraint: "required" } }),
        );
        const jobs = Array.from({ length: 25 }, (_, i) => `p${i}`);
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit(jobs.map((p) => item(p)), jobs); });

        expect(taskService.createTasks).toHaveBeenCalledTimes(1);
        expect(result.current.results.every((r) => r.status === "failed" && r.error === "Thiếu ảnh cho Khung đầu.")).toBe(true);
    });

    it("a definitive failure drops the idempotency key so the next identical submit gets a fresh key, while 429 keeps it", async () => {
        const create = vi.mocked(taskService.createTasks);
        create.mockRejectedValueOnce(new ApiError(402, "INSUFFICIENT_CREDITS", "no credits"));
        create.mockResolvedValue({ batchId: "batch-1", totalCredits: 5, tasks: [task()] });
        const { result } = renderHook(() => useBatchRunner());

        await act(async () => { await result.current.submit([item("p")], ["p"]); });
        await act(async () => { await result.current.submit([item("p")], ["p"]); });
        expect(create.mock.calls[0]?.[1]).not.toBe(create.mock.calls[1]?.[1]);

        create.mockReset();
        create.mockRejectedValue(new ApiError(429, "QUEUE_FULL", "full", "r", { retryAfterSec: 0 }));
        await act(async () => { await result.current.submit([item("q")], ["q"]); });
        create.mockResolvedValue({ batchId: "batch-2", totalCredits: 5, tasks: [task({ batchId: "batch-2" })] });
        await act(async () => { await result.current.submit([item("q")], ["q"]); });
        const keys = create.mock.calls.map(([, key]) => key);
        expect(new Set(keys).size).toBe(1);
    });

    it("restores stored batches with the type taken from the task worker and drops batches that 404", async () => {
        vi.mocked(taskStorageService.getBatches).mockReturnValue([
            { batchId: "b-img", taskIds: ["t-img"], prompts: ["ảnh mèo"], createdAt: new Date().toISOString() },
            { batchId: "b-gone", taskIds: ["t-gone"], prompts: ["x"], createdAt: new Date().toISOString() },
        ]);
        vi.mocked(taskService.getBatch).mockImplementation(async (batchId) => {
            if (batchId === "b-gone") throw new ApiError(404, "BATCH_NOT_FOUND", "nope");
            return { tasks: [task({ id: "t-img", batchId, worker: "text-to-image", status: "succeeded", result: { mediaId: "m", url: "https://x/img.png" } })] };
        });
        const { result } = renderHook(() => useBatchRunner());

        await waitFor(() => expect(result.current.results).toHaveLength(1));

        expect(result.current.results[0]).toMatchObject({ id: "t-img", type: "image", status: "completed", prompt: "ảnh mèo", jobIndex: 1 });
        expect(taskStorageService.removeBatch).toHaveBeenCalledWith("user-1", "b-gone");
        expect(pollBatch).not.toHaveBeenCalled();
    });

    it("cancelAll cancels every active batch and marks their cards as cancelled", async () => {
        vi.mocked(taskService.createTasks).mockResolvedValue({ batchId: "batch-1", totalCredits: 10, tasks: [task({ id: "a" }), task({ id: "b" })] });
        vi.mocked(pollBatch).mockImplementation(() => new Promise(() => undefined));
        vi.mocked(taskService.cancelBatch).mockResolvedValue({
            cancelled: [task({ id: "a", status: "cancelled" }), task({ id: "b", status: "cancelled" })],
            skipped: 0,
            creditsRefunded: 10,
        });
        const { result } = renderHook(() => useBatchRunner());
        act(() => { void result.current.submit([item("a"), item("b")], ["a", "b"]); });
        await waitFor(() => expect(result.current.results[0]?.id).toBe("a"));

        await act(async () => { await result.current.cancelAll(); });

        expect(taskService.cancelBatch).toHaveBeenCalledWith("batch-1");
        expect(result.current.results.every((r) => r.status === "failed" && r.error === "Đã hủy tạo.")).toBe(true);
    });
});
