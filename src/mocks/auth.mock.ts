import type {
    PortalMeResponse,
} from "@/types/api";

export const mockMeResponse: PortalMeResponse = {
    user: {
        id: "usr_demo_001",
        email: "kullchinh@example.com",
        name: "Kull Chính",

        planId: "pro",
        planExpiresAt:
            "2026-12-31T23:59:59.000Z",

        status: "active",

        credits: 1240,

        emailVerified: true,

        maxConcurrentOverride: null,
        maxPendingOverride: null,
        fairUsePerDayOverride: null,

        createdAt:
            "2026-09-01T08:00:00.000Z",
    },

    plan: {
        name: "Pro",

        maxConcurrent: 4,
        maxPending: 50,

        ratePerSec: 5,
        statusRatePerSec: 25,

        chargesCredits: true,
        monthlyCredits: 2000,

        fairUsePerDay: null,

        active: true,

        id: "pro",
        priceVnd: 299_000,
        periodDays: 30,
        description: "4 luồng song song, 2.000 credit mỗi tháng.",
        sortOrder: 2,
    },

    keys: [
        {
            id: "key_demo_001",
            userId: "usr_demo_001",
            label: "Development",
            last4: "A91K",
            revokedAt: null,
            lastUsedAt:
                "2026-10-02T02:30:00.000Z",
            createdAt:
                "2026-09-01T08:10:00.000Z",
        },
    ],

    balance: {
        raw: 1240,
        display: "1.240 credits",
    },

    usage: {
        today: 8,
        last7Days: 42,
        creditsSpentToday: 180,
        creditsSpent7d: 760,
        activeTasks: 2,
        fairUseToday: 0,
    },

    commercialMode: "payg",
    trialDays: 0,
};
