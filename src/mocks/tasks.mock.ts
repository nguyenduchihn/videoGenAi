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

const mockBatches = new Map<string, { tasks: PortalTask[]; polls: number }>();
const MOCK_VIDEO_URL = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
/** PNG 1×1 trong suốt: kết quả ảnh giả không cần mạng. */
const MOCK_IMAGE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export function createMockBatch(body: CreateTasksRequest, priceCredits = 5): { batchId: string; totalCredits: number; tasks: PortalTask[] } {
    const batchId = `batch_mock_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const tasks: PortalTask[] = body.tasks.map((item, index) => ({
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
    }));
    mockBatches.set(batchId, { tasks, polls: 0 });
    return { batchId, totalCredits: priceCredits * tasks.length, tasks };
}

export function getMockBatch(batchId: string): { tasks: PortalTask[] } | null {
    const entry = mockBatches.get(batchId);
    if (!entry) return null;
    entry.polls += 1;
    const now = new Date().toISOString();
    entry.tasks = entry.tasks.map((task, index) => {
        if (task.status !== "pending" && task.status !== "processing") return task;
        const threshold = 2 + index;
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
    return { tasks: entry.tasks };
}

export function cancelMockTask(taskId: string): PortalTask | null {
    for (const entry of mockBatches.values()) {
        const index = entry.tasks.findIndex((task) => task.id === taskId);
        if (index < 0) continue;
        const current = entry.tasks[index]!;
        if (current.status === "pending" || current.status === "processing") {
            entry.tasks[index] = { ...current, status: "cancelled", updatedAt: new Date().toISOString() };
        }
        return entry.tasks[index]!;
    }
    return null;
}

// ── Kiểm tra ảnh/handle như backend (create-batch.use-case.ts) để UI thấy lỗi có metadata ──
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
