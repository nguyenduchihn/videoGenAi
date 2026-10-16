import { FileText } from "lucide-react";
import type { GeneratorDraft } from "@/features/generator/useAutoDraft";

interface DraftRestoreBannerProps {
    draft: GeneratorDraft;
    onRestore: () => void;
    onDismiss: () => void;
}

const timeOf = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export default function DraftRestoreBanner({ draft, onRestore, onDismiss }: DraftRestoreBannerProps) {
    const lines = draft.prompt.split(/\r?\n/).filter((l) => l.trim()).length;
    return (
        <div role="region" aria-label="Khôi phục bản nháp" className="flex flex-col gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3 sm:flex-row sm:items-center">
            <FileText className="hidden h-4 w-4 shrink-0 text-[var(--app-text-muted)] sm:block" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-xs text-[var(--app-text)]">
                <span className="font-semibold">Bản nháp lúc {timeOf(draft.savedAt)}</span> — {lines} dòng prompt · "{draft.prompt.trim().slice(0, 60)}{draft.prompt.trim().length > 60 ? "…" : ""}"
            </p>
            <div className="flex shrink-0 gap-2">
                <button type="button" onClick={onRestore} className="h-8 rounded-lg bg-[var(--app-accent)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--app-accent-hover)]">Khôi phục</button>
                <button type="button" onClick={onDismiss} className="h-8 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text-secondary)] transition hover:text-[var(--app-text)]">Bỏ qua</button>
            </div>
        </div>
    );
}
