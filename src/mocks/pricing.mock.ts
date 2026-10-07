import type {
    PortalPricingResponse,
} from "@/types/api";

export const mockPricingResponse: PortalPricingResponse = {
    workers: {
        "text-to-video": {
            credits: 80,

            models: {
                "veo-3": 80,
            },
        },

        "image-to-video": {
            credits: 100,

            models: {
                "veo-3": 100,
            },
        },

        "reference-images-to-video": {
            credits: 120,

            models: {
                "veo-3": 120,
            },
        },

        "start-end-image-to-video": {
            credits: 120,

            models: {
                "veo-3": 120,
            },
        },

        "extend-video": {
            credits: 100,

            models: {
                "veo-3": 100,
            },
        },

        "text-to-image": {
            credits: 20,

            models: {
                imagen: 20,
            },
        },

        "image-to-image": {
            credits: 20,

            models: {
                imagen: 20,
            },
        },
    },
};