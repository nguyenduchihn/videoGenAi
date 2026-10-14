import { afterEach, describe, expect, it } from "vitest";
import { useFeedbackStore } from "./feedback.store";

afterEach(() => useFeedbackStore.setState({ overlays: [], toasts: [], confirm: null }));

describe("pushToast / removeToast", () => {
    it("adds a toast and returns its id", () => {
        const id = useFeedbackStore.getState().pushToast({ variant: "success", message: "ok" });
        const toasts = useFeedbackStore.getState().toasts;
        expect(toasts).toHaveLength(1);
        expect(toasts[0]!.id).toBe(id);
        expect(toasts[0]!.message).toBe("ok");
        expect(toasts[0]!.duration).toBe(3_000);
    });

    it("applies per-variant default durations", () => {
        useFeedbackStore.getState().pushToast({ variant: "error", message: "e" });
        expect(useFeedbackStore.getState().toasts[0]!.duration).toBe(8_000);
    });

    it("removeToast removes by id", () => {
        const id = useFeedbackStore.getState().pushToast({ variant: "info", message: "hi" });
        useFeedbackStore.getState().removeToast(id);
        expect(useFeedbackStore.getState().toasts).toHaveLength(0);
    });
});

describe("showOverlay / dismissOverlay", () => {
    it("adds and removes an overlay", () => {
        const token = useFeedbackStore.getState().showOverlay("Đang tải...");
        expect(useFeedbackStore.getState().overlays).toHaveLength(1);
        useFeedbackStore.getState().dismissOverlay(token);
        expect(useFeedbackStore.getState().overlays).toHaveLength(0);
    });
});

describe("askConfirm / resolveConfirm", () => {
    it("resolves true when confirmed", async () => {
        const promise = useFeedbackStore.getState().askConfirm({ title: "Xác nhận?" });
        expect(useFeedbackStore.getState().confirm).not.toBeNull();
        useFeedbackStore.getState().resolveConfirm(true);
        expect(await promise).toBe(true);
        expect(useFeedbackStore.getState().confirm).toBeNull();
    });

    it("resolves false when cancelled", async () => {
        const promise = useFeedbackStore.getState().askConfirm({ title: "Xoá?" });
        useFeedbackStore.getState().resolveConfirm(false);
        expect(await promise).toBe(false);
    });
});
