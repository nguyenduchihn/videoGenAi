import { afterEach, describe, expect, it } from "vitest";
import { apiKeyStorage } from "./apiKeyStorage";

afterEach(() => localStorage.clear());

describe("apiKeyStorage", () => {
    it("returns null when empty", () => {
        expect(apiKeyStorage.get()).toBeNull();
    });

    it("round-trips set/get", () => {
        apiKeyStorage.set({ raw: "vk_abc", keyId: "key_1", last4: "abc1" });
        const got = apiKeyStorage.get();
        expect(got?.raw).toBe("vk_abc");
        expect(got?.keyId).toBe("key_1");
    });

    it("clear removes the key", () => {
        apiKeyStorage.set({ raw: "vk_xyz" });
        apiKeyStorage.clear();
        expect(apiKeyStorage.get()).toBeNull();
    });

    it("returns null on corrupt JSON", () => {
        localStorage.setItem("videogen_api_key", "{invalid json}");
        expect(apiKeyStorage.get()).toBeNull();
    });
});
