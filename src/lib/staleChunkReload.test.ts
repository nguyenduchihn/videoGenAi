import { describe, expect, it } from "vitest";
import { isChunkLoadError, reloadOnce } from "./staleChunkReload";

describe("staleChunkReload", () => {
    it("allows one reload, then blocks further reloads within 60 seconds", () => {
        sessionStorage.clear();
        expect(reloadOnce(1_000_000)).toBe(true);
        expect(reloadOnce(1_030_000)).toBe(false);
        expect(reloadOnce(1_070_000)).toBe(true);
    });

    it("recognises the browser messages for a missing lazy chunk", () => {
        expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/TasksPage-abc.js"))).toBe(true);
        expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
        expect(isChunkLoadError(new Error("boom"))).toBe(false);
        expect(isChunkLoadError("string")).toBe(false);
    });
});
