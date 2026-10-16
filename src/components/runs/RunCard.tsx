import { ChevronRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { doneCount, formatEta, runDisplayName, runPercent, runStateLabel } from "@/features/runs/runCopy";
import { formatRelativeTime } from "@/lib/format";
import type { RunSummary } from "@/types/api";

/** Thẻ một lượt trong danh sách / khối gần đây: tên, tiến độ, lỗi, thời gian hoạt động gần nhất. */
export default function RunCard({ run, compact = false }: { run: RunSummary; compact?: boolean }) {
    const percent = runPercent(run);
    const total = Math.max(run.totalPlanned, run.created + run.queuedOnServer);
    const active = run.status === "active";
    return (
        <Link
            to={`/runs/${run.id}`}
            className={`group flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition hover:border-[var(--app-accent)]/60 hover:bg-[var(--app-surface-soft)] ${compact ? "px-4 py-3" : "p-4"}`}
            aria-label={`${runDisplayName(run)}: ${doneCount(run)}/${total} hoàn thành${run.counts.failed > 0 ? `, ${run.counts.failed} lỗi` : ""}`}
        >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]" : "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]"}`}>
                <Layers className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--app-text)]">{runDisplayName(run)}</span>
                    <span className="shrink-0 text-[11px] text-[var(--app-text-muted)]">{formatRelativeTime(run.lastActivityAt)}</span>
                </span>
                <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-surface-soft)]" aria-hidden="true">
                    <span className="block h-full origin-left rounded-full bg-[var(--app-accent)] motion-safe:transition-transform motion-safe:duration-500" style={{ transform: `scaleX(${percent / 100})` }} />
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--app-text-secondary)]">
                    <span className="font-medium text-[var(--app-text)]">{doneCount(run).toLocaleString("vi-VN")}/{total.toLocaleString("vi-VN")}</span>
                    {run.counts.failed > 0 && <span className="text-[var(--app-danger)]">{run.counts.failed} lỗi</span>}
                    <span>·</span>
                    <span>{runStateLabel(run)}</span>
                    {active && run.etaSec !== null && <span>· {formatEta(run.etaSec)}</span>}
                </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--app-text-muted)] transition group-hover:text-[var(--app-accent)]" aria-hidden="true" />
        </Link>
    );
}
