import { useSyncExternalStore } from "react";

// Ngôn ngữ code đã chọn dùng chung cho MỌI khối code trên trang (chọn Python một lần ⇒ cả trang đổi theo), nhớ qua lần mở sau.
const STORAGE_KEY = "api-docs:code-lang";
const listeners = new Set<() => void>();

function read(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

let current = read();

function subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function setPreferredLang(label: string): void {
    current = label;
    try {
        localStorage.setItem(STORAGE_KEY, label);
    } catch {
        // chế độ riêng tư / chặn storage: vẫn đổi trong phiên
    }
    for (const fn of listeners) fn();
}

export function usePreferredLang(): string | null {
    return useSyncExternalStore(subscribe, () => current, () => null);
}
