import { http, HttpResponse } from "msw";

import type { CreateTasksRequest } from "@/types/api";

import { mockMeResponse } from "./auth.mock";
import {
    createMockPaymentIntent,
    createMockPlanIntent,
    getMockPaymentHistory,
    getMockPaymentStatus,
    mockPaymentPackages,
} from "./payment.mock";
import { mockPricingResponse } from "./pricing.mock";
import { mockPlanActivation, mockPlansForSale } from "./plans.mock";
import { mockUploadedImage } from "./images.mock";
import { cancelMockRun, enqueueMockItems, getMockRunSummary, listMockRuns, mockRunTasksPage, renameMockRun, retryMockFailed, seedMockBigRun, upsertMockRun } from "./runs.mock";
import { allMockBatchTasks, cancelMockTask, createMockBatch, getMockBatch, mockTasksResponse, takenRunIndices, validateMockTask } from "./tasks.mock";
import type { RunStatus, TaskStatus } from "@/types/api";

/** e2e: localStorage `videogen:mock-big-run` = N ⇒ /v1/runs có sẵn lượt `run_mock_big` với N task đã xong. */
function seedBigRunIfRequested(): void {
    try {
        const n = Number(localStorage.getItem("videogen:mock-big-run") ?? 0);
        if (n > 0) seedMockBigRun("run_mock_big", n);
    } catch {
        /* bỏ qua */
    }
}

const error = (status: number, code: string, message: string, metadata?: Record<string, unknown>, headers?: Record<string, string>) =>
    HttpResponse.json({ error: { code, message, requestId: `mock-${Date.now()}`, ...(metadata ? { metadata } : {}) } }, { status, headers });

/** e2e: localStorage `videogen:mock-topup-disabled` = "1" ⇒ admin tạm tắt nạp tiền (packages.enabled / pricing.topupEnabled = false). */
function isMockTopupDisabled(): boolean {
    try {
        return typeof localStorage !== "undefined" && localStorage.getItem("videogen:mock-topup-disabled") === "1";
    } catch {
        return false;
    }
}

/** e2e: đặt localStorage `videogen:mock-unauth` = "1" để giả lập chưa đăng nhập (handler chạy trong page). */
/** e2e: localStorage `videogen:mock-mode` = "subscription" ⇒ hệ thống bán gói dịch vụ (nạp credit tắt, /pricing hiện gói); mặc định payg. */
function mockMode(): "payg" | "subscription" {
    try {
        return localStorage.getItem("videogen:mock-mode") === "subscription" ? "subscription" : "payg";
    } catch {
        return "payg";
    }
}
/** e2e: localStorage `videogen:mock-plan-expired` = "1" ⇒ khách đang có gói hết hạn (banner gia hạn). */
function isMockPlanExpired(): boolean {
    try {
        return localStorage.getItem("videogen:mock-plan-expired") === "1";
    } catch {
        return false;
    }
}
/** /portal/auth/me theo chế độ + gói vừa mua (mock) + trạng thái hết hạn giả lập. */
function mockMe() {
    const activation = mockPlanActivation();
    const plan = activation ? (mockPlansForSale.find((p) => p.id === activation.planId) ?? null) : null;
    const expired = isMockPlanExpired() && !activation;
    return {
        ...mockMeResponse,
        commercialMode: mockMode(),
        user: {
            ...mockMeResponse.user,
            planId: activation?.planId ?? mockMeResponse.user.planId,
            planExpiresAt: activation?.planExpiresAt ?? (expired ? "2026-10-01T00:00:00.000Z" : mockMeResponse.user.planExpiresAt),
        },
        plan: plan ? { ...plan, active: true, sortOrder: 0 } : mockMeResponse.plan,
    };
}

function isMockUnauthenticated(): boolean {
    try {
        return typeof localStorage !== "undefined" && localStorage.getItem("videogen:mock-unauth") === "1";
    } catch {
        return false;
    }
}

export const mockModels = {
    video: [
        { model: "Veo_3.1-Lite", family: "veo", default: true, credits: 5 },
        { model: "Veo_3.1-Omni", family: "veo", default: false, credits: 20, note: "Tới 7 ảnh tham chiếu" },
        { model: "Veo_3.1-Lite [Lower Priority]", family: "veo", default: false, credits: 0, note: "Miễn phí, xếp hàng chậm hơn" },
    ],
    image: [{ model: "Nano_Banana_Pro", family: "nano-banana", default: true, credits: 1 }],
};

/** e2e: thân các request POST /v1/tasks đã nhận (handler MSW chạy trong page) để test kiểm tra worker/images. */
function rememberMockRequest(body: CreateTasksRequest): void {
    try {
        if (typeof localStorage === "undefined") return;
        const previous = JSON.parse(localStorage.getItem("videogen:mock-task-requests") ?? "[]") as unknown[];
        localStorage.setItem("videogen:mock-task-requests", JSON.stringify([...previous, body]));
    } catch {
        /* storage bị chặn: bỏ qua */
    }
}

/** e2e: header `x-mock-queue-full` hoặc localStorage `videogen:mock-queue-full` = "1" ⇒ lần gọi /v1/tasks kế tiếp trả 429 (dùng một lần). */
function consumeMockQueueFull(request: Request): boolean {
    if (request.headers.get("x-mock-queue-full")) return true;
    try {
        if (typeof localStorage === "undefined" || localStorage.getItem("videogen:mock-queue-full") !== "1") return false;
        localStorage.removeItem("videogen:mock-queue-full");
        return true;
    } catch {
        return false;
    }
}

/** /v1/* giống backend thật: X-API-Key (tích hợp ngoài) HOẶC cookie phiên web; mock coi "đã đăng nhập" = có cookie. */
const requireApiKey = (request: Request): Response | null => {
    if (request.headers.get("x-api-key")) return null;
    return isMockUnauthenticated() ? error(401, "SESSION_REQUIRED", "login required") : null;
};

export const handlers = [
    // ── Portal auth ──
    http.get("/portal/auth/me", () =>
        isMockUnauthenticated() ? error(401, "SESSION_REQUIRED", "login required") : HttpResponse.json(mockMe()),
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
        // Giống API thật: lọc status, cắt theo limit (≤ 50) và cursor (mock: cursor = vị trí bắt đầu), mới nhất trước.
        const q = new URL(request.url).searchParams;
        const status = q.get("status");
        const limit = Math.min(50, Math.max(1, Number(q.get("limit")) || 20));
        const offset = Math.max(0, Number(q.get("cursor")) || 0);
        seedBigRunIfRequested();
        // Task mẫu đứng trước (e2e lịch sử dựa vào thứ tự này), sau đó là task của các lô/lượt mock đã tạo trong phiên.
        const pool = [...mockTasksResponse.tasks, ...allMockBatchTasks()];
        const all = status ? pool.filter((task) => task.status === status) : pool;
        const tasks = all.slice(offset, offset + limit);
        return HttpResponse.json({ tasks, nextCursor: offset + limit < all.length ? String(offset + limit) : null });
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
    http.get("/portal/pricing", () =>
        mockMode() === "subscription"
            ? HttpResponse.json({ ...mockPricingResponse, topupEnabled: false, packages: [], commercialMode: "subscription", plans: mockPlansForSale })
            : HttpResponse.json({ ...mockPricingResponse, topupEnabled: !isMockTopupDisabled() }),
    ),

    // ── Nạp tiền ──
    http.get("/portal/payments/packages", () =>
        mockMode() === "subscription" ? HttpResponse.json({ ...mockPaymentPackages, enabled: false, packages: [] }) : HttpResponse.json({ ...mockPaymentPackages, enabled: !isMockTopupDisabled() }),
    ),
    http.post("/portal/payments/seapay/create-plan-intent", async ({ request }) => {
        if (mockMode() !== "subscription") return error(409, "MODE_MISMATCH", "Hệ thống đang bán credit theo lượt, không bán gói dịch vụ");
        const body = (await request.json()) as { planId: string };
        try {
            return HttpResponse.json(createMockPlanIntent(body.planId), { status: 201 });
        } catch {
            return error(404, "PLAN_NOT_FOR_SALE", "plan not for sale");
        }
    }),
    http.post("/portal/payments/seapay/create-intent", async ({ request }) => {
        if (mockMode() === "subscription") return error(409, "MODE_MISMATCH", "Hệ thống đang bán gói dịch vụ, không nhận nạp credit");
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
            commercialMode: mockMode(),
            plan: { id: "pro", name: "Pro", maxConcurrent: 4, maxPending: 50, chargesCredits: true },
        }),
    ),
    http.post("/v1/images", async ({ request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        const form = await request.formData();
        const images = [];
        for (const [name, value] of form.entries()) {
            if (!(value instanceof File)) continue;
            if (!value.type.startsWith("image/")) return error(400, "BAD_IMAGE_INPUTS", `${name}: không phải ảnh`, { field: name, constraint: "mime" });
            images.push(mockUploadedImage(name, value));
        }
        return HttpResponse.json({ images }, { status: 201 });
    }),
    http.post("/v1/tasks", async ({ request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        if (consumeMockQueueFull(request)) return error(429, "QUEUE_FULL", "queue full", undefined, { "Retry-After": "2" });
        const body = (await request.json()) as CreateTasksRequest;
        if (!Array.isArray(body.tasks) || body.tasks.length === 0 || body.tasks.length > 20) {
            return error(400, "VALIDATION_FAILED", "tasks: 1–20 task mỗi request");
        }
        for (const [index, item] of body.tasks.entries()) {
            const failure = validateMockTask(item);
            if (failure) return error(failure.status, failure.code, `tasks[${index}]: ${failure.message}`, { index, ...failure.metadata });
        }
        if (body.runId) {
            const offset = body.runOffset ?? 0;
            const taken = takenRunIndices(body.runId).filter((i) => i >= offset && i < offset + body.tasks.length);
            if (taken.length) return error(409, "RUN_INDEX_TAKEN", "runIndex already created", { runId: body.runId, taken });
            upsertMockRun(body.runId, { totalPlanned: offset + body.tasks.length });
        }
        rememberMockRequest(body);
        return HttpResponse.json(createMockBatch(body), { status: 202 });
    }),

    // ── Lượt tạo ──
    http.put("/v1/runs/:id", async ({ params, request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        const body = (await request.json()) as { name?: string | null; totalPlanned: number };
        const r = upsertMockRun(params.id as string, body);
        return HttpResponse.json(r.run, { status: r.created ? 201 : 200 });
    }),
    http.get("/v1/runs", ({ request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        seedBigRunIfRequested();
        const status = (new URL(request.url).searchParams.get("status") || undefined) as RunStatus | undefined;
        return HttpResponse.json({ runs: listMockRuns(status).slice(0, 50), nextCursor: null });
    }),
    http.get("/v1/runs/:id", ({ params, request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        seedBigRunIfRequested();
        const run = getMockRunSummary(params.id as string);
        return run ? HttpResponse.json(run) : error(404, "RUN_NOT_FOUND", "run not found");
    }),
    http.get("/v1/runs/:id/tasks", ({ params, request }) => {
        const denied = requireApiKey(request);
        if (denied) return denied;
        seedBigRunIfRequested();
        const url = new URL(request.url);
        const status = (url.searchParams.get("status") || undefined) as TaskStatus | undefined;
        const cursorRaw = url.searchParams.get("cursor");
        const page = mockRunTasksPage(params.id as string, status, cursorRaw ? Number(cursorRaw) : undefined, Number(url.searchParams.get("limit") ?? 50));
        return page ? HttpResponse.json(page) : error(404, "RUN_NOT_FOUND", "run not found");
    }),
    http.post("/v1/runs/:id/cancel", ({ params }) => {
        const r = cancelMockRun(params.id as string);
        return r ? HttpResponse.json(r) : error(404, "RUN_NOT_FOUND", "run not found");
    }),
    http.patch("/v1/runs/:id", async ({ params, request }) => {
        const body = (await request.json()) as { name: string | null };
        const r = renameMockRun(params.id as string, body.name);
        return r ? HttpResponse.json(r) : error(404, "RUN_NOT_FOUND", "run not found");
    }),
    http.post("/v1/runs/:id/items", async ({ params, request }) => {
        const body = (await request.json()) as { items: CreateTasksRequest["tasks"]; runOffset: number };
        const r = enqueueMockItems(params.id as string, body);
        return r ? HttpResponse.json(r, { status: 202 }) : error(404, "RUN_NOT_FOUND", "run not found");
    }),
    http.post("/v1/runs/:id/retry-failed", async ({ params, request }) => {
        const body = (await request.json().catch(() => ({}))) as { taskIds?: string[] };
        const r = retryMockFailed(params.id as string, body.taskIds);
        return r ? HttpResponse.json(r, { status: 202 }) : error(404, "RUN_NOT_FOUND", "run not found");
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
        const active = batch.tasks.filter((task) => task.status === "pending" || task.status === "processing");
        const cancelled = active.map((task) => cancelMockTask(task.id)).filter((task) => task !== null);
        const creditsRefunded = cancelled.reduce((sum, task) => sum + task.priceCredits, 0);
        return HttpResponse.json({ cancelled, skipped: batch.tasks.length - cancelled.length, creditsRefunded });
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
