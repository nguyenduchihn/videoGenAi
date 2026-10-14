import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import api from "./api";
import { ApiError } from "./errors";
import { storeRegistry } from "./storeRegistry";

afterEach(() => {
    storeRegistry.setClearUser(() => undefined);
    storeRegistry.setRedirect(() => undefined);
});

describe("request shape", () => {
    it("never sends X-API-Key: /v1/ relies on the session cookie like /portal/", async () => {
        let seen: string | null = "unset";
        server.use(http.get("/v1/models", ({ request }) => { seen = request.headers.get("x-api-key"); return HttpResponse.json({}); }));
        await api.get("/v1/models");
        expect(seen).toBeNull();
        expect(api.defaults.withCredentials).toBe(true);
    });
});

describe("response interceptor", () => {
    it("rejects with ApiError carrying code and requestId", async () => {
        server.use(http.get("/portal/ledger", () => HttpResponse.json({ error: { code: "INTENT_NOT_FOUND", message: "x", requestId: "req-1" } }, { status: 404 })));
        const err = await api.get("/portal/ledger").catch((e: unknown) => e);
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).code).toBe("INTENT_NOT_FOUND");
        expect((err as ApiError).requestId).toBe("req-1");
    });

    it("clears the session and redirects on 401 from a /portal/ data route", async () => {
        const clearSpy = vi.fn();
        const redirectSpy = vi.fn();
        storeRegistry.setClearUser(clearSpy);
        storeRegistry.setRedirect(redirectSpy);
        server.use(http.get("/portal/tasks", () => new HttpResponse(null, { status: 401 })));
        await api.get("/portal/tasks").catch(() => undefined);
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(redirectSpy).toHaveBeenCalledWith("/login?reason=expired");
    });

    it("treats 401 from /v1/ as an expired session too (same cookie)", async () => {
        const clearSpy = vi.fn();
        const redirectSpy = vi.fn();
        storeRegistry.setClearUser(clearSpy);
        storeRegistry.setRedirect(redirectSpy);
        server.use(http.get("/v1/models", () => new HttpResponse(null, { status: 401 })));
        await api.get("/v1/models").catch(() => undefined);
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(redirectSpy).toHaveBeenCalledWith("/login?reason=expired");
    });

    it("does not redirect on 401 from /portal/auth/me (MainLayout handles it)", async () => {
        const redirectSpy = vi.fn();
        storeRegistry.setRedirect(redirectSpy);
        server.use(http.get("/portal/auth/me", () => new HttpResponse(null, { status: 401 })));
        await api.get("/portal/auth/me").catch(() => undefined);
        expect(redirectSpy).not.toHaveBeenCalled();
    });
});
