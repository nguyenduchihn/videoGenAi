import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import api from "./api";
import { apiKeyStorage } from "./apiKeyStorage";
import { ApiError } from "./errors";
import { storeRegistry } from "./storeRegistry";

afterEach(() => {
    localStorage.clear();
    storeRegistry.setClearUser(() => undefined);
    storeRegistry.setOpenConnectDialog(() => undefined);
    storeRegistry.setRedirect(() => undefined);
});

function captureHeader(path: string): { value: () => string | null } {
    let seen: string | null = null;
    server.use(
        http.get(path, ({ request }) => {
            seen = request.headers.get("x-api-key");
            return HttpResponse.json({});
        }),
    );
    return { value: () => seen };
}

describe("request interceptor", () => {
    it("sets X-API-Key for /v1/ when a key is stored", async () => {
        apiKeyStorage.set({ raw: "vk_test_key" });
        const header = captureHeader("/v1/models");
        await api.get("/v1/models");
        expect(header.value()).toBe("vk_test_key");
    });

    it("does not send X-API-Key to /portal/ URLs", async () => {
        apiKeyStorage.set({ raw: "vk_should_not_appear" });
        const header = captureHeader("/portal/auth/me");
        await api.get("/portal/auth/me");
        expect(header.value()).toBeNull();
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

    it("does not redirect on 401 from /portal/auth/me (MainLayout handles it)", async () => {
        const redirectSpy = vi.fn();
        storeRegistry.setRedirect(redirectSpy);
        server.use(http.get("/portal/auth/me", () => new HttpResponse(null, { status: 401 })));
        await api.get("/portal/auth/me").catch(() => undefined);
        expect(redirectSpy).not.toHaveBeenCalled();
    });

    it("opens the connect-key dialog on 401 from /v1/", async () => {
        const dialogSpy = vi.fn();
        storeRegistry.setOpenConnectDialog(dialogSpy);
        server.use(http.get("/v1/models", () => new HttpResponse(null, { status: 401 })));
        await api.get("/v1/models").catch(() => undefined);
        expect(dialogSpy).toHaveBeenCalledTimes(1);
    });
});
