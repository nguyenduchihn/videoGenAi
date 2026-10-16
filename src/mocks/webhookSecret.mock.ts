import { http, HttpResponse } from "msw";

// Khoá ký webhook (GET /portal/webhook-secret tạo lười, POST …/rotate đổi khoá) — trạng thái trong bộ nhớ của tab.
let secret = { secret: "whsec_mock_9f2c7a1e4b6d8f0a3c5e7b9d1f3a5c7e9b1d3f5a7c9", createdAt: "2026-10-16T08:00:00.000Z" };

export const webhookSecretHandlers = [
    http.get("/portal/webhook-secret", () => HttpResponse.json(secret)),
    http.post("/portal/webhook-secret/rotate", () => {
        secret = { secret: `whsec_mock_${Math.random().toString(36).slice(2).padEnd(12, "0")}${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
        return HttpResponse.json(secret, { status: 201 });
    }),
];
