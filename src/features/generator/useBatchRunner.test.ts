import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBatchRunner } from "./useBatchRunner";

vi.mock("@/services/task.service", () => ({
    taskService: { createTasks: vi.fn(), getBatch: vi.fn(), cancelTask: vi.fn() },
}));
vi.mock("@/lib/pollBatch", () => ({
    pollBatch: vi.fn(),
    isBatchFinished: vi.fn(),
}));
vi.mock("@/services/taskStorage.service", () => ({
    taskStorageService: {
        getBatches: vi.fn(() => []),
        saveBatch: vi.fn(),
        removeBatch: vi.fn(),
    },
}));
vi.mock("@/stores/apiKey.store", () => ({
    useApiKeyStore: {
        getState: () => ({ key: { raw: "test-key" }, openConnectDialog: vi.fn() }),
    },
}));
vi.mock("@/stores/auth.store", () => ({
    useAuthStore: (selector: (state: { user: { user: { id: string } } }) => unknown) =>
        selector({ user: { user: { id: "user-1" } } }),
}));
vi.mock("@/hooks/useFeedback", () => ({
    useFeedback: () => ({ toast: { warning: vi.fn(), error: vi.fn(), success: vi.fn() } }),
}));

import { taskService } from "@/services/task.service";
import { pollBatch } from "@/lib/pollBatch";
import { taskStorageService } from "@/services/taskStorage.service";

const MOCK_TASK = {
    id: "task-1",
    batchId: "batch-1",
    status: "pending" as const,
    stage: "queued" as never,
    worker: "text-to-video",
    model: null,
    priceCredits: 5,
    result: null,
    error: null,
    creditsRefunded: 0,
    createdAt: "",
    updatedAt: "",
    completedAt: null,
};

describe("useBatchRunner", () => {
    beforeEach(() => { vi.clearAllMocks(); vi.mocked(taskStorageService.getBatches).mockReturnValue([]); });

    it("submit stores batch and maps results; completed result has url", async () => {
        vi.mocked(taskService.createTasks).mockResolvedValue({
            batchId: "batch-1",
            totalCredits: 5,
            tasks: [MOCK_TASK],
        } as never);
        vi.mocked(pollBatch).mockImplementation(async (_id, onUpdate) => {
            onUpdate([{ ...MOCK_TASK, status: "succeeded", result: { url: "https://example.com/v.mp4" } } as never]);
            return [];
        });

        const { result } = renderHook(() => useBatchRunner());
        await act(async () => {
            await result.current.submit(
                ["test prompt"],
                () => [{ worker: "text-to-video" as const, params: { prompt: "test prompt" } }],
                { mode: "text-to-video", modelKey: "Veo_3.1-Lite", files: {} as never, estimatedCredits: 5 },
            );
        });

        expect(taskStorageService.saveBatch).toHaveBeenCalledWith("user-1", "batch-1", ["task-1"], ["test prompt"]);
        const completed = result.current.results.find((r) => r.status === "completed");
        expect(completed?.url).toBe("https://example.com/v.mp4");
        expect(taskStorageService.removeBatch).toHaveBeenCalledWith("user-1", "batch-1");
    });

    it("onExhausted keeps batch stored — removeBatch not called", async () => {
        vi.mocked(taskService.createTasks).mockResolvedValue({ batchId: "batch-2", totalCredits: 5, tasks: [{ ...MOCK_TASK, batchId: "batch-2" }] } as never);
        vi.mocked(pollBatch).mockImplementation(async (_id, _onUpdate, opts) => { opts?.onExhausted?.(); return []; });

        const { result } = renderHook(() => useBatchRunner());
        await act(async () => {
            await result.current.submit(
                ["test"],
                () => [{ worker: "text-to-video" as const, params: {} }],
                { mode: "text-to-video", modelKey: "Veo_3.1-Lite", files: {} as never, estimatedCredits: 5 },
            );
        });

        expect(taskStorageService.removeBatch).not.toHaveBeenCalled();
    });
});
