import { http, HttpResponse } from "msw";

import type { CreateTasksRequest } from "@/types/api";

import { mockMeResponse } from "./auth.mock";
import {
    createMockPaymentIntent,
    getMockPaymentHistory,
    getMockPaymentStatus,
    mockPaymentPackages,
} from "./payment.mock";
import { mockPricingResponse } from "./pricing.mock";
import { cancelMockTask, createMockBatch, getMockBatch, mockTasksResponse } from "./tasks.mock";

const error = (status: number, code: string, message: string) =>
    HttpResponse.json({ error: { code, message, requestId: `mock-${Date.now()}` } }, { status });

/** e2e: đặt localStorage `videogen:mock-unauth` = "1" để giả lập chưa đăng nhập (handler chạy trong page). */
function isMockUnauthenticated(): boolean {
    try {
        return typeof localStorage !== "undefined" && localStorage.getItem("videogen:mock-unauth") === "1";
    } catch {
        return false;
    }
}

export const mockModels = {
    video: [{ model: "Veo_3.1-Lite", family: "veo", default: true, credits: 5 }],
    image: [{ model: "Nano_Banana_2_Lite", family: "nano-banana", default: true, credits: 1 }],
};

/** /v1/* giống backend thật: X-API-Key (tích hợp ngoài) HOẶC cookie phiên web; mock coi "đã đăng nhập" = có cookie. */
const requireApiKey = (request: Request): Response | null => {
    if (request.headers.get("x-api-key")) return null;
    return isMockUnauthenticated() ? error(401, "SESSION_REQUIRED", "login required") : null;
};

export const handlers = [
    // ── Portal auth ──
    http.get("/portal/auth/me", () =>
        isMockUnauthenticated() ? error(401, "SESSION_REQUIRED", "login required") : HttpResponse.json(mockMeResponse),
    ),
    http.post("/portal/auth/login", () => HttpResponse.json({ ok: true })),
    http.post("/portal/auth/logout", () => new HttpResponse(null, { status: 204 })),
    http.post("/portal/auth/register", async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json({ ok: true, email: body.email, emailSent: true, devToken: "dev-verify-token" }, { status: 201 });
    }),
    http.post("/portal/auth/verify-email", async ({ request }) => {
        const body = (await request.json()) as { token: string };
        if (!body.token || body.token === "expired") return error(400, "TOKEN_EXPIRED", "token expired");
        return HttpResponse.json({
            ok: true,
            user: mockMeResponse.user,
            firstKey: { id: "key_first", raw: "vk_mock_first_key_raw", last4: "fkey", label: "Key đầu tiên" },
        });
    }),
    http.post("/portal/auth/resend-verification", () => HttpResponse.json({ ok: true, devToken: "dev-verify-token" })),
    http.post("/portal/auth/forgot-password", () => HttpResponse.json({ ok: true, devToken: "dev-reset-token" })),
    http.post("/portal/auth/reset-password", async ({ request }) => {
        const body = (await request.json()) as { token: string; newPassword: string };
        if (body.token === "expired") return error(400, "TOKEN_EXPIRED", "token expired");
        if (body.newPassword.length < 8) return error(400, "WEAK_PASSWORD", "weak password");
        return HttpResponse.json({ ok: true, email: mockMeResponse.user.email });
    }),

    // ── API keys ──
    http.get("/portal/api-keys", () => HttpResponse.json(mockMeResponse.keys)),
    http.post("/portal/api-keys", async ({ request }) => {
        const body = (await request.json()) as { label: string };
        return HttpResponse.json({ id: `key_${Date.now().toString(36)}`, raw: "vk_mock_new_key_raw", last4: "mock", label: body.label }, { status: 201 });
    }),
    http.post("/portal/api-keys/rotate", () =>
        HttpResponse.json({ id: "key_rotated", raw: "vk_mock_rotated_raw", last4: "rota", label: "Key xoay" }, { status: 201 }),
    ),
    http.delete("/portal/api-keys/:id", () => new HttpResponse(null, { status: 204 })),

    // ── Tasks (cookie) ──
    http.get("/portal/tasks", ({ request }) => {
        const status = new URL(request.url).searchParams.get("status");
        const tasks = status ? mockTasksResponse.tasks.filter((task) => task.status === status) : mockTasksResponse.tasks;
        return HttpResponse.json({ tasks, nextCursor: null });
    }),
    http.get("/portal/tasks/:id", ({ params }) => {
        const task = mockTasksResponse.tasks.find((item) => item.id === params.id);
        return task ? HttpResponse.json(task) : error(404, "TASK_NOT_FOUND", "task not found");
    }),
    http.post("/portal/tasks/:id/cancel", ({ params }) => {
        const task = mockTasksResponse.tasks.find((item) => item.id === params.id);
        return task ? HttpResponse.json({ ...task, status: "cancelled" }) : error(404, "TASK_NOT_FOUND", "task not found");
    }),

    // ── Credits ──
    http.get("/portal/ledger", () =>
        HttpResponse.json({
            items: [
                { id: "led_1", kind: "signup_grant", delta: 100, balanceAfter: 100, taskId: null, refId: mockMeResponse.user.id, note: null, createdAt: "2026-10-01T08:00:00.000Z" },
                { id: "led_2", kind: "usage", delta: -5, balanceAfter: 95, taskId: "task_demo_001", refId: null, note: null, createdAt: "2026-10-02T08:12:30.000Z" },
                { id: "led_3", kind: "topup", delta: 500, balanceAfter: 595, taskId: null, refId: "int_demo", note: "Starter", createdAt: "2026-10-05T10:00:00.000Z" },
            ],
            nextCursor: null,
            balance: mockMeResponse.balance.raw,
        }),
    ),
    http.get("/portal/pricing", () => HttpResponse.json(mockPricingResponse)),

    // ── Nạp tiền ──
    http.get("/portal/payments/packages", () => HttpResponse.json(mockPaymentPackages)),
    http.post("/portal/payments/seapay/create-intent", async ({ request }) => {
        const body = (await request.json()) as { packageId: string };
        try {
            return HttpResponse.json(createMockPaymentIntent(body), { status: 201 });
        } catch {
            return error(404, "PACKAGE_NOT_FOUND", "package not found");
        }
    }),
    http.get("/portal/payments/intents/:id/status", ({ params }) => {
        const intent = getMockPaymentStatus(params.id as string);
        return intent ? HttpResponse.json(intent) : error(404, "INTENT_NOT_FOUND", "intent not found");
    }),
    http.get("/portal/payments/intents", () => HttpResponse.json(getMockPaymentHistory())),

    // ── v1 (X-API-Key hoặc cookie phiên) ──
    http.get("/v1/models", ({ request }) => requireApiKey(request) ?? HttpResponse.json(mockModels)),
    http.get("/v1/me", ({ request }) =>
        requireApiKey(request) ?? HttpResponse.json({
            userId: mockMeResponse.user.id,
            credits: mockMeResponse.user.credits,
            status: "active",
            emailVerified: true,
            planExpiresAt: null,
            plan: { id: "pro", name: "Pro", maxConcurrent: 4, maxPending: 50, chargesCredits: true },
        }),
    ),
    http.post("/v1/images", ({ request }) =>
        requireApiKey(request) ?? HttpResponse.json({
            images: [{ imageId: `img_${Date.now().toString(36)}`, mime: "image/png", size: 1024, sha256: "", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() }],
        }, { status: 201 }),
    ),
    http.post("/v1/tasks", async ({ request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        const body = (await request.json()) as CreateTasksRequest;
        return HttpResponse.json(createMockBatch(body), { status: 202 });
    }),
    http.get("/v1/batches/:id", ({ params, request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        const batch = getMockBatch(params.id as string);
        return batch ? HttpResponse.json(batch) : error(404, "BATCH_NOT_FOUND", "batch not found");
    }),
    http.post("/v1/batches/:id/cancel", ({ params }) => {
        const batch = getMockBatch(params.id as string);
        if (!batch) return error(404, "BATCH_NOT_FOUND", "batch not found");
        batch.tasks.forEach((task) => cancelMockTask(task.id));
        return HttpResponse.json(getMockBatch(params.id as string));
    }),
    http.get("/v1/tasks/:id", ({ params }) => {
        const task = mockTasksResponse.tasks.find((item) => item.id === params.id);
        return task ? HttpResponse.json(task) : error(404, "TASK_NOT_FOUND", "task not found");
    }),
    http.post("/v1/tasks/:id/cancel", ({ params }) => {
        const task = cancelMockTask(params.id as string);
        return task ? HttpResponse.json(task) : error(404, "TASK_NOT_FOUND", "task not found");
    }),
];
