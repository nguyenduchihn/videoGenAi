import type {
    PortalTasksResponse,
} from "@/types/api";

export const mockTasksResponse: PortalTasksResponse = {
    tasks: [
        {
            id: "task_demo_001",
            batchId: "batch_demo_001",

            status: "succeeded",
            stage: "generate",

            worker: "text-to-video",
            model: "veo-3",

            priceCredits: 80,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: {
                mediaId: "media_demo_001",
                url: null,

                mock: true,
                resolution: "1080P",

                base: {
                    mediaId:
                        "media_demo_001_base",
                    url: null,
                },
            },

            error: null,

            creditsRefunded: 0,

            createdAt:
                "2026-10-02T08:10:00.000Z",

            updatedAt:
                "2026-10-02T08:12:30.000Z",

            completedAt:
                "2026-10-02T08:12:30.000Z",
        },

        {
            id: "task_demo_002",
            batchId: "batch_demo_002",

            status: "processing",
            stage: "generate",

            worker: "image-to-video",
            model: "veo-3",

            priceCredits: 100,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: null,

            error: null,

            creditsRefunded: 0,

            createdAt:
                "2026-10-02T08:20:00.000Z",

            updatedAt:
                "2026-10-02T08:21:00.000Z",

            completedAt: null,
        },

        {
            id: "task_demo_003",
            batchId: "batch_demo_003",

            status: "pending",
            stage: "generate",

            worker: "text-to-video",
            model: "veo-3",

            priceCredits: 80,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: null,

            error: null,

            creditsRefunded: 0,

            createdAt:
                "2026-10-02T08:25:00.000Z",

            updatedAt:
                "2026-10-02T08:25:00.000Z",

            completedAt: null,
        },

        {
            id: "task_demo_004",
            batchId: "batch_demo_004",

            status: "failed",
            stage: "generate",

            worker:
                "reference-images-to-video",

            model: "veo-3",

            priceCredits: 120,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: null,

            error: {
                code: "GENERATION_FAILED",
                message:
                    "Video generation failed",
            },

            creditsRefunded: 120,

            createdAt:
                "2026-10-01T15:30:00.000Z",

            updatedAt:
                "2026-10-01T15:33:00.000Z",

            completedAt:
                "2026-10-01T15:33:00.000Z",
        },

        {
            id: "task_demo_005",
            batchId: "batch_demo_005",

            status: "cancelled",
            stage: "generate",

            worker: "text-to-video",
            model: "veo-3",

            priceCredits: 80,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: null,

            error: {
                code: "TASK_CANCELLED",
                message:
                    "Task was cancelled",
            },

            creditsRefunded: 80,

            createdAt:
                "2026-10-01T12:00:00.000Z",

            updatedAt:
                "2026-10-01T12:02:00.000Z",

            completedAt:
                "2026-10-01T12:02:00.000Z",
        },

        {
            id: "task_demo_006",
            batchId: "batch_demo_006",

            status: "succeeded",
            stage: "upscale",

            worker: "image-to-video",
            model: "veo-3",

            priceCredits: 140,


            generationMode: "mock",


            runId: null,


            runIndex: null,


            prompt: null,

            result: {
                mediaId: "media_demo_006",
                url: null,

                mock: true,
                resolution: "4K",

                base: {
                    mediaId:
                        "media_demo_006_base",
                    url: null,
                },

                upscale: {
                    status: "done",
                },
            },

            error: null,

            creditsRefunded: 0,

            createdAt:
                "2026-09-30T10:00:00.000Z",

            updatedAt:
                "2026-09-30T10:05:00.000Z",

            completedAt:
                "2026-09-30T10:05:00.000Z",
        },
    ],

    nextCursor: null,
};
// ── Mô phỏng /v1/tasks + /v1/batches/:id: task chuyển pending → processing → succeeded sau vài lần poll ──
import type { CreateTasksRequest, PortalTask } from "@/types/api";
import { loadMockState, scheduleMockPersist } from "./mockState";

type MockBatch = { tasks: MockTask[]; polls: number };
const persisted = loadMockState<{ seq: number; batches: Array<[string, MockBatch]> }>("tasks");
const mockBatches = new Map<string, MockBatch>(persisted?.batches ?? []);
const MOCK_VIDEO_URL = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
/** PNG 1×1 trong suốt: kết quả ảnh giả không cần mạng. */
const MOCK_IMAGE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** Task mock giữ thêm `retriedAt` (API thật không lộ) để mô phỏng "thử lại job thất bại". */
export type MockTask = PortalTask & { retriedAt?: string };

let batchSeq = persisted?.seq ?? 0;

/** Ghi lại sau mỗi thay đổi (kể cả khi runs.mock sửa task trực tiếp). */
export const persistMockTasks = (): void => scheduleMockPersist("tasks", () => ({ seq: batchSeq, batches: [...mockBatches] }));

/** runIndex đã có trong lượt (task đã tạo) — mô phỏng 409 RUN_INDEX_TAKEN. */
export function takenRunIndices(runId: string): number[] {
    return mockTasksOfRun(runId).map((t) => t.runIndex).filter((i): i is number => i !== null);
}

/** Mọi task của các lô/lượt mock đã tạo trong phiên (kể cả lượt run_mock_big) ⇒ lịch sử + thư viện mock có dữ liệu. */
export function allMockBatchTasks(): MockTask[] {
    return [...mockBatches.values()].flatMap((b) => b.tasks);
}

export function mockTasksOfRun(runId: string): MockTask[] {
    return [...mockBatches.values()].flatMap((b) => b.tasks).filter((t) => t.runId === runId);
}

export function createMockBatch(body: CreateTasksRequest, priceCredits = 5, runIndices?: number[]): { batchId: string; totalCredits: number; tasks: PortalTask[] } {
    batchSeq += 1;
    const batchId = `batch_mock_${Date.now().toString(36)}_${batchSeq}`;
    const now = new Date().toISOString();
    const tasks: MockTask[] = body.tasks.map((item, index) => ({
        id: `${batchId}_t${index + 1}`,
        batchId,
        status: "pending",
        stage: "generate",
        worker: item.worker,
        model: typeof item.params.model === "string" ? item.params.model : null,
        priceCredits,
        generationMode: "mock",
        result: null,
        error: null,
        creditsRefunded: 0,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        runId: body.runId ?? null,
        runIndex: body.runId ? (runIndices?.[index] ?? (body.runOffset ?? 0) + index) : null,
        prompt: typeof item.params.prompt === "string" ? item.params.prompt.slice(0, 500) : null,
        voice: item.worker === "reference-images-to-video" && typeof item.params.audio === "string" ? item.params.audio : null,
    }));
    mockBatches.set(batchId, { tasks, polls: 0 });
    persistMockTasks();
    return { batchId, totalCredits: priceCredits * tasks.length, tasks };
}

export function getMockBatch(batchId: string): { tasks: PortalTask[] } | null {
    const entry = mockBatches.get(batchId);
    if (!entry) return null;
    entry.polls += 1;
    const now = new Date().toISOString();
    entry.tasks = entry.tasks.map((task, index) => {
        if (task.status !== "pending" && task.status !== "processing") return task;
        const threshold = 2 + Math.min(index, 3); // lô 20 task xong sau ~6 lần poll (e2e lượt lớn không chờ quá lâu)
        if (entry.polls >= threshold + 1) {
            return {
                ...task,
                status: "succeeded",
                updatedAt: now,
                completedAt: now,
                result: { mediaId: `media_${task.id}`, url: isMockVideoWorker(task.worker) ? MOCK_VIDEO_URL : MOCK_IMAGE_URL, mock: true },
            };
        }
        if (entry.polls >= threshold) return { ...task, status: "processing", updatedAt: now };
        return task;
    });
    persistMockTasks();
    return { tasks: entry.tasks };
}

export function cancelMockTask(taskId: string): PortalTask | null {
    for (const entry of mockBatches.values()) {
        const index = entry.tasks.findIndex((task) => task.id === taskId);
        if (index < 0) continue;
        const current = entry.tasks[index]!;
        if (current.status === "pending" || current.status === "processing") {
            entry.tasks[index] = { ...current, status: "cancelled", updatedAt: new Date().toISOString() };
            persistMockTasks();
        }
        return entry.tasks[index]!;
    }
    return null;
}

// ── Kiểm tra ảnh/handle như backend (create-batch.use-case.ts) để UI thấy lỗi có metadata ──
import { MOCK_VOICE_IDS } from "./voices.mock";
import type { CreateTaskItem, ImageRef, TaskWorker } from "@/types/api";

export interface MockTaskError {
    status: number;
    code: string;
    message: string;
    metadata?: Record<string, unknown>;
}

const OMNI = "Veo_3.1-Omni";
const HANDLE_RE = /^[a-z][a-z0-9_-]{0,29}$/;
const MENTION_RE = /(?:^|[^a-z0-9@])@([a-z][a-z0-9_-]{0,29})/gi;
const VIDEO_WORKERS = new Set<TaskWorker>(["text-to-video", "image-to-video", "reference-images-to-video", "start-end-image-to-video", "extend-video"]);
const ROLE_RULES: Record<TaskWorker, { required: string[]; allowed: string[] }> = {
    "text-to-video": { required: [], allowed: [] },
    "image-to-video": { required: ["start"], allowed: ["start"] },
    "start-end-image-to-video": { required: ["start", "end"], allowed: ["start", "end"] },
    "reference-images-to-video": { required: ["references"], allowed: ["references"] },
    "extend-video": { required: [], allowed: [] },
    "text-to-image": { required: [], allowed: [] },
    "image-to-image": { required: [], allowed: ["source", "sources"] },
};

export const isMockVideoWorker = (worker: string): boolean => VIDEO_WORKERS.has(worker as TaskWorker);

const bad = (message: string, metadata: Record<string, unknown>): MockTaskError => ({ status: 400, code: "BAD_IMAGE_INPUTS", message, metadata });
const refsOf = (value: ImageRef | ImageRef[] | undefined): ImageRef[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

function checkHandles(worker: string, refs: ImageRef[], prompt: unknown): MockTaskError | null {
    const seen = new Set<string>();
    for (const ref of refs) {
        if (typeof ref === "string" || !ref.handle) continue;
        if (!HANDLE_RE.test(ref.handle)) return bad(`${worker}: handle "${ref.handle}" không hợp lệ`, { field: "images", handle: ref.handle, constraint: "handleFormat" });
        if (seen.has(ref.handle)) return bad(`${worker}: handle "${ref.handle}" trùng`, { field: "images", handle: ref.handle, constraint: "handleUnique" });
        seen.add(ref.handle);
    }
    if (typeof prompt !== "string") return null;
    for (const match of prompt.matchAll(MENTION_RE)) {
        const handle = match[1]!.toLowerCase();
        if (!seen.has(handle)) return bad(`${worker}: prompt nhắc @${handle} nhưng không có ảnh`, { field: "params.prompt", handle, constraint: "mentionUnbound", handles: [...seen] });
    }
    return null;
}

export function validateMockTask(item: CreateTaskItem): MockTaskError | null {
    const rules = ROLE_RULES[item.worker];
    if (!rules) return { status: 400, code: "VALIDATION_FAILED", message: `worker không hợp lệ: ${item.worker}` };
    const images = item.images ?? {};
    const given = (Object.keys(images) as Array<keyof typeof images>).filter((key) => images[key] !== undefined && refsOf(images[key]).length > 0);
    const disallowed = given.find((key) => !rules.allowed.includes(key));
    if (disallowed) return bad(`${item.worker}: không dùng images.${disallowed}`, { field: `images.${disallowed}`, worker: item.worker, constraint: "roleNotAllowed" });
    const missing = rules.required.find((key) => !given.includes(key as keyof typeof images));
    if (missing) return bad(`${item.worker}: thiếu images.${missing}`, { field: `images.${missing}`, worker: item.worker, constraint: "required" });

    const model = typeof item.params.model === "string" ? item.params.model : null;
    if (item.worker === "image-to-image") {
        if (given.includes("source") && given.includes("sources")) return bad("image-to-image: chỉ một trong source/sources", { field: "images.sources", constraint: "exclusive" });
        if (given.length === 0) return bad("image-to-image: thiếu images.sources", { field: "images.sources", worker: item.worker, constraint: "required" });
        const count = refsOf(images.sources).length;
        if (count > 10) return bad("image-to-image: tối đa 10 ảnh", { field: "images.sources", worker: item.worker, constraint: "maxCount", max: 10, given: count, model });
    }
    if (item.worker === "reference-images-to-video") {
        const max = model === OMNI ? 7 : 3;
        const count = refsOf(images.references).length;
        if (count > max) return bad(`reference-images-to-video: tối đa ${max} ảnh`, { field: "images.references", worker: item.worker, constraint: "maxCount", max, given: count, model, omniMax: 7 });
        const audio = item.params.audio;
        if (audio !== undefined && (typeof audio !== "string" || !MOCK_VOICE_IDS.has(audio))) {
            return { status: 400, code: "VALIDATION_FAILED", message: "params.audio: must be a voice id from GET /v1/voices (e.g. achernar) or \"none\"" };
        }
    }
    if (item.worker === "start-end-image-to-video" && model === OMNI) {
        return { status: 400, code: "VALIDATION_FAILED", message: "start-end-image-to-video: Veo_3.1-Omni không hỗ trợ" };
    }
    if (item.worker === "extend-video" && !item.sourceMediaId) {
        return { status: 404, code: "SOURCE_MEDIA_NOT_FOUND", message: "extend-video: sourceMediaId không tồn tại" };
    }
    const allRefs = [...refsOf(images.start), ...refsOf(images.end), ...refsOf(images.references), ...refsOf(images.source), ...refsOf(images.sources)];
    return checkHandles(item.worker, allRefs, item.params.prompt);
}
