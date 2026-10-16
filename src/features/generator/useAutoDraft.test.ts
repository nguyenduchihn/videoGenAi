import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratorSettingsState } from "@/components/generator/types";
import { clearDraft, readDraft, useAutoDraft, writeDraft, type GeneratorDraft } from "./useAutoDraft";

const settings: GeneratorSettingsState = { model: "veo", duration: 8, audioEnabled: true, upscale: "none", seed: null, customSeparator: "" };
const snapshot = (prompt: string): Omit<GeneratorDraft, "savedAt"> => ({ prompt, mode: "text-to-video", ratio: "16:9", settings });

describe("draft storage", () => {
    beforeEach(() => localStorage.clear());

    it("round-trips a draft per user and ignores blank or malformed entries", () => {
        writeDraft("u1", snapshot("mèo lướt sóng"));
        expect(readDraft("u1")?.prompt).toBe("mèo lướt sóng");
        expect(readDraft("u1")?.savedAt).toMatch(/^\d{4}-/);
        expect(readDraft("u2")).toBeNull();
        localStorage.setItem("videogen:draft:u3", "{not json");
        expect(readDraft("u3")).toBeNull();
        writeDraft("u4", snapshot("   "));
        expect(readDraft("u4")).toBeNull();
        clearDraft("u1");
        expect(readDraft("u1")).toBeNull();
    });
});

describe("useAutoDraft", () => {
    beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
    afterEach(() => vi.useRealTimers());

    it("offers the saved draft on mount, restores it on demand and does not overwrite it with the empty initial form", () => {
        writeDraft("u1", snapshot("nháp cũ"));
        const apply = vi.fn();
        const { result } = renderHook(() => useAutoDraft("u1", snapshot(""), apply));
        expect(result.current.pending?.prompt).toBe("nháp cũ");
        act(() => { vi.advanceTimersByTime(5_000); });
        expect(readDraft("u1")?.prompt).toBe("nháp cũ"); // lần render đầu không ghi đè
        act(() => result.current.restore());
        expect(apply).toHaveBeenCalledWith(expect.objectContaining({ prompt: "nháp cũ" }));
        expect(result.current.pending).toBeNull();
    });

    it("saves 2 s after the last edit and clears the draft when the prompt is emptied or dismissed", () => {
        const { result, rerender } = renderHook(({ prompt }) => useAutoDraft("u1", snapshot(prompt), vi.fn()), { initialProps: { prompt: "" } });
        rerender({ prompt: "một" });
        act(() => { vi.advanceTimersByTime(1_500); });
        expect(readDraft("u1")).toBeNull();
        rerender({ prompt: "một chú mèo" });
        act(() => { vi.advanceTimersByTime(2_000); });
        expect(readDraft("u1")?.prompt).toBe("một chú mèo");
        rerender({ prompt: "" });
        act(() => { vi.advanceTimersByTime(2_000); });
        expect(readDraft("u1")).toBeNull();
        writeDraft("u1", snapshot("x"));
        act(() => result.current.dismiss());
        expect(readDraft("u1")).toBeNull();
    });
});
