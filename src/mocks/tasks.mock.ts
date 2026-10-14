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
                result: { mediaId: `media_${task.id}`, url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", mock: true },
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
