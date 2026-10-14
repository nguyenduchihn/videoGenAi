import { describe, expect, it } from "vitest";
import { ApiError, getErrorMessage, toApiError } from "./errors";

const makeAxiosErr = (status: number, code: string, message: string, requestId?: string) => ({
    isAxiosError: true,
    message: "Request failed",
    response: { status, data: { error: { code, message, requestId } } },
    config: { url: "/portal/test" },
});

describe("toApiError", () => {
    it("parses axios error envelope", () => {
        const err = makeAxiosErr(400, "EMAIL_TAKEN", "Email đã tồn tại", "req_1");
        const ae = toApiError(err);
        expect(ae).toBeInstanceOf(ApiError);
        expect(ae.status).toBe(400);
        expect(ae.code).toBe("EMAIL_TAKEN");
        expect(ae.requestId).toBe("req_1");
    });

    it("returns NETWORK for axios error with no response", () => {
        const err = { isAxiosError: true, message: "Network Error", response: undefined, config: {} };
        const ae = toApiError(err);
        expect(ae.code).toBe("NETWORK");
        expect(ae.status).toBe(0);
    });

    it("returns INTERNAL for unknown errors", () => {
        const ae = toApiError(new Error("oops"));
        expect(ae.code).toBe("INTERNAL");
        expect(ae.message).toBe("oops");
    });

    it("returns same ApiError if already ApiError", () => {
        const orig = new ApiError(403, "FORBIDDEN", "no");
        expect(toApiError(orig)).toBe(orig);
    });
});

describe("getErrorMessage", () => {
    it("returns Vietnamese text for known codes", () => {
        const msg = getErrorMessage(makeAxiosErr(401, "INVALID_CREDENTIALS", "bad"));
        expect(msg).toContain("mật khẩu");
    });
    it("returns rate-limit message for 429", () => {
        const msg = getErrorMessage(makeAxiosErr(429, "RATE_LIMIT", "slow down"));
        expect(msg).toContain("nhanh");
    });
    it("falls back to server message for unknown code", () => {
        const msg = getErrorMessage(makeAxiosErr(500, "UNKNOWN_XYZ", "server said so"));
        expect(msg).toBe("server said so");
    });
});
