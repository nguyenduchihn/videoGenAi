import { Layers, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRunsQuery } from "@/features/runs/useRuns";
import { doneCount, formatEta, runDisplayName, runStateLabel } from "@/features/runs/runCopy";

const DISMISS_KEY = "videogen:run-banner-dismissed";
const readDismissed = (): string | null => {
    try {
        return sessionStorage.getItem(DISMISS_KEY);
    } catch {
        return null;
    }
};

/** Banner lượt đang chạy gần nhất; ẩn được trong phiên (sessionStorage ⇒ đổi trang/mount lại không hiện lại). */
export default function RunBanner({ excludeRunId }: { excludeRunId?: string | null }) {
    const [dismissed, setDismissed] = useState<string | null>(readDismissed);
    const dismiss = (runId: string) => {
        setDismissed(runId);
        try {
            sessionStorage.setItem(DISMISS_KEY, runId);
        } catch {
            /* bỏ qua */
        }
    };
    const query = useRunsQuery("active", { limit: 3 });
    const run = query.data?.pages[0]?.runs.find((r) => r.id !== excludeRunId && r.id !== dismissed);
    if (!run) return null;
    const total = Math.max(run.totalPlanned, run.created + run.queuedOnServer);
    return (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-[var(--app-accent)]/40 bg-[var(--app-accent-soft)] px-4 py-3">
            <Layers className="h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-xs text-[var(--app-text)]">
                <span className="font-semibold">Lượt tạo đang chạy:</span> {runDisplayName(run)} — {doneCount(run).toLocaleString("vi-VN")}/{total.toLocaleString("vi-VN")} hoàn thành
                {run.counts.failed > 0 ? ` · ${run.counts.failed} thất bại` : ""} · {runStateLabel(run)}{run.etaSec !== null ? ` · ${formatEta(run.etaSec)}` : ""}
            </p>
            <Link to={`/runs/${run.id}`} className="shrink-0 rounded-lg bg-[var(--app-accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--app-accent-hover)]">Xem</Link>
            <button type="button" onClick={() => dismiss(run.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:text-[var(--app-text)]" aria-label="Ẩn thông báo">
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
