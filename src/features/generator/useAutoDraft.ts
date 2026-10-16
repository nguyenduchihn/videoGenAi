import { useCallback, useEffect, useRef, useState } from "react";
import type { GeneratorMode, GeneratorSettingsState } from "@/components/generator/types";

export interface GeneratorDraft {
    prompt: string;
    mode: GeneratorMode;
    ratio: string;
    settings: GeneratorSettingsState;
    savedAt: string;
}

const KEY_PREFIX = "videogen:draft:";
const SAVE_DEBOUNCE_MS = 2_000;
const keyOf = (userId: string) => `${KEY_PREFIX}${userId}`;

export function readDraft(userId: string): GeneratorDraft | null {
    try {
        const raw = localStorage.getItem(keyOf(userId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<GeneratorDraft>;
        return typeof parsed.prompt === "string" && parsed.prompt.trim() && typeof parsed.savedAt === "string" ? (parsed as GeneratorDraft) : null;
    } catch {
        return null;
    }
}

export function writeDraft(userId: string, draft: Omit<GeneratorDraft, "savedAt">): void {
    try {
        localStorage.setItem(keyOf(userId), JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    } catch {
        /* hết quota / bị chặn */
    }
}

export function clearDraft(userId: string): void {
    try {
        localStorage.removeItem(keyOf(userId));
    } catch {
        /* bỏ qua */
    }
}

/**
 * Tự lưu bản nháp (prompt + chế độ + cài đặt) 2 s sau lần sửa cuối; khi mở trang có nháp khác với form ⇒ đề nghị khôi phục.
 * Thay cho "Dự án" cũ (localStorage) — không phải thực thể máy chủ.
 */
export function useAutoDraft(userId: string, current: Omit<GeneratorDraft, "savedAt">, apply: (draft: GeneratorDraft) => void) {
    const [pending, setPending] = useState<GeneratorDraft | null>(() => (userId ? readDraft(userId) : null));
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dirty = useRef(false);

    useEffect(() => {
        if (!userId) return;
        if (!dirty.current) {
            dirty.current = true; // lần render đầu: không ghi đè nháp đã có bằng form trống
            return;
        }
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (current.prompt.trim()) writeDraft(userId, current);
            else clearDraft(userId);
        }, SAVE_DEBOUNCE_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [userId, current]);

    const restore = useCallback(() => {
        if (!pending) return;
        apply(pending);
        setPending(null);
    }, [apply, pending]);

    const dismiss = useCallback(() => {
        setPending(null);
        if (userId) clearDraft(userId);
    }, [userId]);

    return { pending, restore, dismiss };
}
