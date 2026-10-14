import type { StoredApiKey } from "@/types/api";

const SK = "videogen_api_key";

export const apiKeyStorage = {
    get(): StoredApiKey | null {
        try {
            const raw = localStorage.getItem(SK);
            if (!raw) return null;
            const parsed: unknown = JSON.parse(raw);
            if (typeof parsed !== "object" || parsed === null || typeof (parsed as { raw?: unknown }).raw !== "string") return null;
            return parsed as StoredApiKey;
        } catch { return null; }
    },
    set(key: StoredApiKey): void {
        try { localStorage.setItem(SK, JSON.stringify(key)); } catch { /* quota */ }
    },
    clear(): void {
        try { localStorage.removeItem(SK); } catch { /* unavailable */ }
    },
};
