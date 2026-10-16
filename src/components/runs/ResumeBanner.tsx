import { Send, Trash2 } from "lucide-react";
import type { PendingResume } from "@/features/runs/useRunSubmitter";

interface ResumeBannerProps {
    pending: PendingResume[];
    isSubmitting: boolean;
    onResume: (runId: string) => void;
    onDiscard: (runId: string) => void;
}

/** Bản kê còn chunk chưa gửi (đóng tab giữa chừng / lỗi) ⇒ đề nghị gửi tiếp. */
export default function ResumeBanner({ pending, isSubmitting, onResume, onDiscard }: ResumeBannerProps) {
    if (pending.length === 0) return null;
    return (
        <div role="alert" className="space-y-2">
            {pending.map((item) => (
                <div key={item.runId} className="flex flex-col gap-2 rounded-2xl border border-[var(--app-warning)]/50 bg-[var(--app-warning-soft)] px-4 py-3 sm:flex-row sm:items-center">
                    <p className="min-w-0 flex-1 text-xs text-[var(--app-text)]">
                        <span className="font-semibold">Lượt "{item.name ?? item.runId.slice(0, 8)}"</span> còn {item.remaining.toLocaleString("vi-VN")}/{item.total.toLocaleString("vi-VN")} job chưa gửi
                        {item.error ? ` — lần trước lỗi: ${item.error}` : " (đóng tab giữa chừng)"}.
                    </p>
                    <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => onResume(item.runId)} disabled={isSubmitting} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--app-accent)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--app-accent-hover)] disabled:opacity-50">
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />Gửi tiếp
                        </button>
                        <button type="button" onClick={() => onDiscard(item.runId)} disabled={isSubmitting} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text-secondary)] transition hover:text-[var(--app-text)] disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Bỏ phần còn lại
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
