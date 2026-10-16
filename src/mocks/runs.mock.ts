import type { CreateTaskItem, CreateTasksRequest, PortalTask, RunCounts, RunStatus, RunSummary, RunTasksPage, TaskStatus } from "@/types/api";
import { clearMockState, loadMockState, scheduleMockPersist } from "./mockState";
import { createMockBatch, getMockBatch, mockTasksOfRun, persistMockTasks, takenRunIndices } from "./tasks.mock";

interface MockRun {
    id: string;
    name: string | null;
    totalPlanned: number;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    queued: Array<{ runIndex: number; spec: CreateTaskItem }>;
    pausedReason: RunSummary["pausedReason"];
}

const runs = new Map<string, MockRun>(loadMockState<Array<[string, MockRun]>>("runs") ?? []);
const MOCK_FEED_PER_TICK = 20;
const persistRuns = (): void => scheduleMockPersist("runs", () => [...runs]);

export function resetMockRuns(): void {
    runs.clear();
    clearMockState("runs");
}

export function upsertMockRun(id: string, input: { name?: string | null; totalPlanned: number }): { run: RunSummary; created: boolean } {
    const existing = runs.get(id);
    if (existing) return { run: summarize(existing), created: false };
    const now = new Date().toISOString();
    const run: MockRun = { id, name: input.name ?? null, totalPlanned: input.totalPlanned, cancelledAt: null, createdAt: now, updatedAt: now, queued: [], pausedReason: null };
    runs.set(id, run);
    persistRuns();
    return { run: summarize(run), created: true };
}

export const getMockRun = (id: string): MockRun | undefined => runs.get(id);

const EMPTY: RunCounts = { pending: 0, processing: 0, succeeded: 0, failed: 0, cancelled: 0 };

function summarize(run: MockRun): RunSummary {
    const tasks = mockTasksOfRun(run.id);
    const counts = { ...EMPTY };
    let retried = 0;
    for (const t of tasks) {
        if (t.status === "failed" && t.retriedAt) retried += 1;
        else counts[t.status] += 1;
    }
    const active = counts.pending + counts.processing;
    const created = tasks.length;
    const status: RunStatus = run.cancelledAt ? "cancelled" : active + run.queued.length > 0 || created + run.queued.length < run.totalPlanned ? "active" : "done";
    const remaining = active + run.queued.length;
    return {
        id: run.id,
        name: run.name,
        totalPlanned: run.totalPlanned,
        created,
        queuedOnServer: run.queued.length,
        counts,
        retried,
        status,
        pausedReason: run.pausedReason,
        etaSec: remaining > 0 && created > 0 ? remaining * 4 : null,
        cancelledAt: run.cancelledAt,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        lastActivityAt: tasks.reduce((last, t) => (t.updatedAt > last ? t.updatedAt : last), run.updatedAt),
    };
}

/** Mỗi lần đọc tóm tắt: tiến triển các lô (pending → processing → succeeded) và "feeder" đẩy tối đa 20 job xếp hàng. */
export function getMockRunSummary(id: string): RunSummary | null {
    const run = runs.get(id);
    if (!run) return null;
    tickMockRun(run);
    return summarize(run);
}

function tickMockRun(run: MockRun): void {
    for (const batchId of new Set(mockTasksOfRun(run.id).map((t) => t.batchId))) getMockBatch(batchId);
    if (run.queued.length && !run.cancelledAt) {
        const slice = run.queued.splice(0, MOCK_FEED_PER_TICK);
        createMockBatch({ tasks: slice.map((s) => s.spec), runId: run.id, runOffset: slice[0]!.runIndex }, 1, slice.map((s) => s.runIndex));
        run.updatedAt = new Date().toISOString();
        persistRuns();
    }
}

export function listMockRuns(status?: RunStatus): RunSummary[] {
    return [...runs.values()]
        .map((run) => { tickMockRun(run); return summarize(run); })
        .filter((s) => !status || s.status === status)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function mockRunTasksPage(id: string, status: TaskStatus | undefined, cursor: number | undefined, limit: number): RunTasksPage | null {
    const run = runs.get(id);
    if (!run) return null;
    tickMockRun(run);
    const all = mockTasksOfRun(id)
        .filter((t) => (!status || t.status === status) && (cursor === undefined || (t.runIndex ?? -1) > cursor))
        .sort((a, b) => (a.runIndex ?? 0) - (b.runIndex ?? 0));
    const page = all.slice(0, limit);
    return { tasks: page, nextCursor: all.length > limit ? String(page.at(-1)?.runIndex ?? 0) : null };
}

export function cancelMockRun(id: string): { run: RunSummary; cancelled: number; queuedCancelled: number; creditsRefunded: number } | null {
    const run = runs.get(id);
    if (!run) return null;
    const queuedCancelled = run.queued.length;
    run.queued = [];
    let cancelled = 0;
    let creditsRefunded = 0;
    for (const t of mockTasksOfRun(id)) {
        if (t.status !== "pending" && t.status !== "processing") continue;
        t.status = "cancelled";
        t.updatedAt = new Date().toISOString();
        cancelled += 1;
        creditsRefunded += t.priceCredits;
    }
    run.cancelledAt = new Date().toISOString();
    persistRuns();
    persistMockTasks();
    return { run: summarize(run), cancelled, queuedCancelled, creditsRefunded };
}

export function renameMockRun(id: string, name: string | null): RunSummary | null {
    const run = runs.get(id);
    if (!run) return null;
    run.name = name;
    run.updatedAt = new Date().toISOString();
    persistRuns();
    return summarize(run);
}

export function enqueueMockItems(id: string, body: { items: CreateTaskItem[]; runOffset: number }): { added: number; duplicates: number[]; run: RunSummary } | null {
    const run = runs.get(id);
    if (!run) return null;
    const taken = new Set([...takenRunIndices(id), ...run.queued.map((q) => q.runIndex)]);
    const duplicates: number[] = [];
    let added = 0;
    body.items.forEach((spec, i) => {
        const runIndex = body.runOffset + i;
        if (taken.has(runIndex)) duplicates.push(runIndex);
        else { run.queued.push({ runIndex, spec }); added += 1; }
    });
    run.totalPlanned = Math.max(run.totalPlanned, body.runOffset + body.items.length);
    run.updatedAt = new Date().toISOString();
    persistRuns();
    return { added, duplicates, run: summarize(run) };
}

export function retryMockFailed(id: string, taskIds?: string[]): { created: number; skipped: number; run: RunSummary } | null {
    const run = runs.get(id);
    if (!run) return null;
    const failed = mockTasksOfRun(id).filter((t) => t.status === "failed" && !t.retriedAt && (!taskIds || taskIds.includes(t.id)));
    failed.forEach((t, i) => {
        t.retriedAt = new Date().toISOString();
        run.queued.push({ runIndex: run.totalPlanned + i, spec: { worker: t.worker as CreateTaskItem["worker"], params: { prompt: t.prompt ?? "", model: t.model ?? undefined } } });
    });
    run.totalPlanned += failed.length;
    persistRuns();
    persistMockTasks();
    return { created: failed.length, skipped: (taskIds?.length ?? failed.length) - failed.length, run: summarize(run) };
}

/** e2e: lượt lớn N job đã xong (để thử lưới ảo hoá). */
export function seedMockBigRun(id: string, total: number): void {
    if (runs.has(id)) return;
    upsertMockRun(id, { name: `Lượt lớn ${total} job`, totalPlanned: total });
    for (let offset = 0; offset < total; offset += 20) {
        const n = Math.min(20, total - offset);
        const body: CreateTasksRequest = { tasks: Array.from({ length: n }, (_, i) => ({ worker: "text-to-image", params: { prompt: `Ảnh số ${offset + i + 1}` } })), runId: id, runOffset: offset };
        createMockBatch(body, 1);
    }
    for (const t of mockTasksOfRun(id)) {
        const i = t.runIndex ?? 0;
        t.status = i % 50 === 7 ? "failed" : "succeeded";
        t.error = t.status === "failed" ? { code: "UNUSUAL_ACTIVITY", message: "reCAPTCHA score too low" } : null;
        t.result = t.status === "succeeded" ? { mediaId: `media_${t.id}`, url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", mock: true } : null;
        t.completedAt = new Date().toISOString();
    }
    persistMockTasks();
}

export type { PortalTask };
