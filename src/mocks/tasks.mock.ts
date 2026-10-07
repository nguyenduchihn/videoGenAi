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