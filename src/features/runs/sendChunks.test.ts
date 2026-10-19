import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/errors";
import type { CreateTaskItem, PortalTask } from "@/types/api";
import { planChunks, remainingJobs, type RunManifest } from "./runManifest";
import { sendChunks, type SendDeps } from "./sendChunks";

const task = (i: number): CreateTaskItem => ({ worker: "text-to-video", params: { prompt: `p${i}` } });
const manifestOf = (n: number): RunManifest => ({
    runId: "11111111-2222-4333-8444-555555555555",
    userId: "u1",
    name: null,
    createdAt: "2026-10-15T00:00:00.000Z",
    ratio: "16:9",
    jobs: Array.from({ length: n }, (_, i) => `p${i}`),
    tasks: Array.from({ length: n }, (_, i) => task(i)),
    chunks: planChunks(n, 20),
});
const created = (n: number) => ({ batchId: "b", totalCredits: n, tasks: [] as PortalTask[] });

function deps(over: Partial<SendDeps> = {}): SendDeps & { saved: RunManifest[] } {
    const saved: RunManifest[] = [];
    return {
        createTasks: vi.fn(async (p) => created(p.tasks.length)),
        enqueueRunItems: vi.fn(async (_id, input) => ({ added: input.items.length, duplicates: [], run: {} as never })),
        save: vi.fn(async (m) => { saved.push(m); }),
        sleep: vi.fn(async () => undefined),
        saved,
        ...over,
    };
}

describe("sendChunks", () => {
    it("sends chunks of 20 sequentially with keys derived from (runId, index) and runOffset per chunk", async () => {
        const d = deps();
        const result = await sendChunks(manifestOf(45), d);
        const calls = vi.mocked(d.createTasks).mock.calls;
        expect(calls.map(([p]) => [p.tasks.length, p.runOffset])).toEqual([[20, 0], [20, 20], [5, 40]]);
        expect(new Set(calls.map(([, key]) => key)).size).toBe(3);
        expect(calls.every(([, key]) => /^[A-Za-z0-9_-]{8,128}$/.test(key))).toBe(true);
        expect(result.chunks.every((c) => c.state === "sent")).toBe(true);
        expect(remainingJobs(result)).toBe(0);
        expect(d.saved).toHaveLength(3);
    });

    it("skips chunks already sent and treats 409 RUN_INDEX_TAKEN as sent (resume after tab close)", async () => {
        const m = manifestOf(45);
        m.chunks[0]!.state = "sent";
        const d = deps({
            createTasks: vi.fn()
                .mockRejectedValueOnce(new ApiError(409, "RUN_INDEX_TAKEN", "taken", "r", { metadata: { taken: [20, 21] } }))
                .mockResolvedValueOnce(created(5))
        });
        const result = await sendChunks(m, d);
        expect(vi.mocked(d.createTasks).mock.calls.map(([p]) => p.runOffset)).toEqual([20, 40]);
        expect(result.chunks.map((c) => c.state)).toEqual(["sent", "sent", "sent"]);
    });

    it("429 QUEUE_FULL ⇒ remaining chunks are queued on the server in one items request and marked queued", async () => {
        const d = deps({
            createTasks: vi.fn()
                .mockResolvedValueOnce(created(20))
                .mockRejectedValueOnce(new ApiError(429, "QUEUE_FULL", "full", "r", { retryAfterSec: 30 }))
        });
        const result = await sendChunks(manifestOf(45), d);
        expect(vi.mocked(d.enqueueRunItems).mock.calls).toHaveLength(1);
        expect(vi.mocked(d.enqueueRunItems).mock.calls[0]?.[1]).toMatchObject({ runOffset: 20 });
        expect(vi.mocked(d.enqueueRunItems).mock.calls[0]?.[1].items).toHaveLength(25);
        expect(result.chunks.map((c) => c.state)).toEqual(["sent", "queued", "queued"]);
        expect(remainingJobs(result)).toBe(0);
    });

    it("429 RATE_LIMITED waits Retry-After and retries the same chunk", async () => {
        const d = deps({
            createTasks: vi.fn()
                .mockRejectedValueOnce(new ApiError(429, "RATE_LIMITED", "slow", "r", { retryAfterSec: 2 }))
                .mockResolvedValueOnce(created(5))
        });
        const result = await sendChunks(manifestOf(5), d);
        expect(d.sleep).toHaveBeenCalledWith(2_000);
        expect(vi.mocked(d.createTasks)).toHaveBeenCalledTimes(2);
        expect(result.chunks[0]?.state).toBe("sent");
    });

    it("IMAGE_NOT_FOUND re-uploads once via onImageNotFound and resends with rebuilt tasks", async () => {
        const rebuilt = [{ worker: "image-to-video" as const, params: { prompt: "p0" }, images: { start: "new" } }];
        const d = deps({
            createTasks: vi.fn()
                .mockRejectedValueOnce(new ApiError(400, "IMAGE_NOT_FOUND", "gone", "r", { metadata: { imageId: "old" } }))
                .mockResolvedValueOnce(created(1)),
            onImageNotFound: vi.fn(async () => rebuilt),
        });
        const result = await sendChunks(manifestOf(1), d);
        expect(d.onImageNotFound).toHaveBeenCalledWith("old");
        expect(vi.mocked(d.createTasks).mock.calls[1]?.[0].tasks).toEqual(rebuilt);
        expect(result.tasks).toEqual(rebuilt);
        expect(result.chunks[0]?.state).toBe("sent");
    });

    it("a definitive error marks the chunk failed with Vietnamese copy, keeps later chunks pending and stops", async () => {
        const d = deps({ createTasks: vi.fn().mockRejectedValue(new ApiError(402, "INSUFFICIENT_CREDITS", "no", "r", { metadata: { required: 50, balance: 10 } })) });
        const result = await sendChunks(manifestOf(45), d);
        expect(vi.mocked(d.createTasks)).toHaveBeenCalledTimes(1);
        expect(result.chunks.map((c) => c.state)).toEqual(["failed", "pending", "pending"]);
        expect(result.chunks[0]?.error).toContain("Không đủ credit");
        expect(remainingJobs(result)).toBe(45);
    });
});
