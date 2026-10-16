import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, unknown>();
vi.mock("idb-keyval", () => ({
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: unknown) => { store.set(key, value); }),
    del: vi.fn(async (key: string) => { store.delete(key); }),
    keys: vi.fn(async () => [...store.keys()]),
}));

import { deleteManifest, listManifests, loadManifest, planChunks, remainingJobs, saveManifest, type RunManifest } from "./runManifest";

const manifest = (runId: string, userId = "u1", createdAt = "2026-10-15T00:00:00.000Z"): RunManifest => ({
    runId, userId, name: null, createdAt, ratio: "16:9", jobs: ["a", "b", "c"], tasks: [], chunks: planChunks(3, 2),
});

describe("runManifest", () => {
    beforeEach(() => store.clear());

    it("planChunks splits jobs into pending chunks of the given size", () => {
        expect(planChunks(45, 20)).toEqual([
            { index: 0, from: 0, to: 20, state: "pending" },
            { index: 1, from: 20, to: 40, state: "pending" },
            { index: 2, from: 40, to: 45, state: "pending" },
        ]);
        expect(planChunks(0, 20)).toEqual([]);
    });

    it("remainingJobs counts pending and failed chunks only", () => {
        const m = manifest("r1");
        expect(remainingJobs(m)).toBe(3);
        m.chunks[0]!.state = "sent";
        expect(remainingJobs(m)).toBe(1);
        m.chunks[1]!.state = "failed";
        expect(remainingJobs(m)).toBe(1);
        m.chunks[1]!.state = "queued";
        expect(remainingJobs(m)).toBe(0);
    });

    it("saves, loads, lists per user (newest first) and deletes", async () => {
        await saveManifest(manifest("r1", "u1", "2026-10-15T00:00:00.000Z"));
        await saveManifest(manifest("r2", "u1", "2026-10-16T00:00:00.000Z"));
        await saveManifest(manifest("r3", "u2"));
        expect((await loadManifest("u1", "r1"))?.runId).toBe("r1");
        expect(await loadManifest("u2", "r1")).toBeNull();
        expect((await listManifests("u1")).map((m) => m.runId)).toEqual(["r2", "r1"]);
        await deleteManifest("u1", "r2");
        expect((await listManifests("u1")).map((m) => m.runId)).toEqual(["r1"]);
    });
});
