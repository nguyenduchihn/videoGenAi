import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { listApiKeys } from "./portal.api";

describe("listApiKeys", () => {
    it("normalizes bare array response", async () => {
        server.use(
            http.get("/portal/api-keys", () =>
                HttpResponse.json([{ id: "k1", userId: "u1", label: "Dev", last4: "abcd", revokedAt: null, lastUsedAt: null, createdAt: "2026-01-01T00:00:00Z" }]),
            ),
        );
        const keys = await listApiKeys();
        expect(Array.isArray(keys)).toBe(true);
        expect(keys[0]!.id).toBe("k1");
    });

    it("normalizes wrapped {items} response", async () => {
        server.use(
            http.get("/portal/api-keys", () =>
                HttpResponse.json({ items: [{ id: "k2", userId: "u1", label: "Prod", last4: "xyz1", revokedAt: null, lastUsedAt: null, createdAt: "2026-01-01T00:00:00Z" }] }),
            ),
        );
        const keys = await listApiKeys();
        expect(keys[0]!.id).toBe("k2");
    });
});
