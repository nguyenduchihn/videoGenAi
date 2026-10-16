import { Globe, X } from "lucide-react";
import { useState } from "react";

const KEY = "videogen:domain-moved-dismissed";
/** Hiện tới hết ngày này (2 tuần sau khi chuyển miền 2026-10-16). */
const SHOW_UNTIL = new Date("2026-10-31T00:00:00+07:00").getTime();
export const NEW_API_BASE = "https://api.aiveo3.org/v1";

const isDismissed = (): boolean => {
    try {
        return localStorage.getItem(KEY) === "1";
    } catch {
        return false;
    }
};

/** Báo chuyển sang aiveo3.org + base URL mới cho tích hợp API key; ẩn được, tự hết sau 2 tuần. */
export function DomainMovedBanner({ now }: { now?: number }) {
    const [dismissed, setDismissed] = useState(isDismissed);
    const [mountedAt] = useState(() => now ?? Date.now());
    if (dismissed || mountedAt >= SHOW_UNTIL) return null;
    const dismiss = () => {
        try { localStorage.setItem(KEY, "1"); } catch { /* bỏ qua */ }
        setDismissed(true);
    };
    return (
        <div role="note" aria-label="Thông báo đổi tên miền" className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--app-accent)]/30 bg-[var(--app-accent-soft)] px-4 py-3">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />
            <p className="flex-1 text-sm text-[var(--app-text)]">
                VideoGen AI đã chuyển sang <strong>aiveo3.org</strong>. Nếu bạn tích hợp qua API key, hãy đổi base URL sang{" "}
                <code className="rounded bg-[var(--app-surface)] px-1.5 py-0.5 text-xs">{NEW_API_BASE}</code> — địa chỉ cũ vẫn chuyển tiếp tới giữa tháng 11.
            </p>
            <button type="button" onClick={dismiss} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:text-[var(--app-text)]" aria-label="Ẩn thông báo đổi tên miền">
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
