import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    message: string;
    requestId?: string;
    duration: number;
}

export interface OverlayItem {
    token: string;
    message: string;
    blocking: boolean;
}

export interface ConfirmRequest {
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

const DURATIONS: Record<ToastVariant, number> = {
    success: 3_000,
    error: 8_000,
    warning: 5_000,
    info: 4_000,
};

interface FeedbackState {
    overlays: OverlayItem[];
    toasts: ToastItem[];
    confirm: (ConfirmRequest & { resolve: (ok: boolean) => void }) | null;
    showOverlay(message: string, opts?: { blocking?: boolean }): string;
    dismissOverlay(token: string): void;
    pushToast(t: Omit<ToastItem, "id" | "duration"> & { duration?: number }): string;
    removeToast(id: string): void;
    askConfirm(req: ConfirmRequest): Promise<boolean>;
    resolveConfirm(ok: boolean): void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
    overlays: [],
    toasts: [],
    confirm: null,

    showOverlay(message, opts) {
        const token = crypto.randomUUID();
        set((s) => ({ overlays: [...s.overlays, { token, message, blocking: opts?.blocking ?? false }] }));
        return token;
    },
    dismissOverlay(token) {
        set((s) => ({ overlays: s.overlays.filter((o) => o.token !== token) }));
    },
    pushToast(t) {
        const id = crypto.randomUUID();
        const item: ToastItem = { ...t, id, duration: t.duration ?? DURATIONS[t.variant] };
        set((s) => ({ toasts: [...s.toasts, item] }));
        return id;
    },
    removeToast(id) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
    askConfirm(req) {
        return new Promise<boolean>((resolve) => {
            set({ confirm: { ...req, resolve } });
        });
    },
    resolveConfirm(ok) {
        const c = get().confirm;
        if (c) { c.resolve(ok); set({ confirm: null }); }
    },
}));
