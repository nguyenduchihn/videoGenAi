import { Check, Download, Pencil, RefreshCw, X, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { doneCount, formatEta, runDisplayName, runPercent, runStateLabel } from "@/features/runs/runCopy";
import type { RunSummary } from "@/types/api";

export interface RunProgressHeaderProps {
    run: RunSummary;
    /** Job còn trong bản kê client chưa gửi (mở lại tab). */
    remainingLocal?: number;
    sticky?: boolean;
    compact?: boolean;
    onRename?: (name: string | null) => void;
    onCancelRemaining?: () => void;
    onRetryFailed?: () => void;
    onDownloadAll?: () => void;
    isBusy?: boolean;
}

const ACTION = "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

function Pill({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "muted" | "info" }) {
    const tones = {
        success: "bg-[var(--app-success-soft)] text-[var(--app-success)]",
        danger: "bg-[var(--app-danger-soft)] text-[var(--app-danger)]",
        info: "bg-[var(--app-info-soft)] text-[var(--app-info)]",
        muted: "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]",
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
            <span className="font-semibold">{value.toLocaleString("vi-VN")}</span> {label}
        </span>
    );
}

function RenameForm({ name, onSubmit, onCancel }: { name: string | null; onSubmit: (name: string | null) => void; onCancel: () => void }) {
    const [value, setValue] = useState(name ?? "");
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit(value.trim() || null);
    };
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label htmlFor="run-name" className="sr-only">Tên lượt tạo</label>
            <input
                id="run-name"
                autoFocus
                value={value}
                maxLength={120}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Escape") onCancel(); }}
                className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-accent)]"
            />
            <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white" aria-label="Lưu tên">
                <Check className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)]" aria-label="Huỷ đổi tên">
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </form>
    );
}

/** Tiêu đề lượt: tên (đổi được), thanh tiến độ, đếm theo trạng thái, ước tính còn, hành động hàng loạt. */
export default function RunProgressHeader({ run, remainingLocal = 0, sticky = false, compact = false, onRename, onCancelRemaining, onRetryFailed, onDownloadAll, isBusy = false }: RunProgressHeaderProps) {
    const [editing, setEditing] = useState(false);
    const renameButtonRef = useRef<HTMLButtonElement>(null);
    const closeRename = () => {
        setEditing(false);
        requestAnimationFrame(() => renameButtonRef.current?.focus()); // form gỡ ⇒ không để focus rơi về <body>
    };
    const percent = runPercent(run);
    const done = doneCount(run);
    const total = Math.max(run.totalPlanned, run.created + run.queuedOnServer);
    const active = run.counts.pending + run.counts.processing + run.queuedOnServer + remainingLocal;
    const failedPercent = total > 0 ? Math.round((run.counts.failed / total) * 100) : 0;

    return (
        <header className={`${sticky ? "sticky top-[var(--app-header-h)] z-20" : ""} border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--app-surface)]/85`}>
            <div className={`mx-auto max-w-[1440px] px-4 ${compact ? "py-3" : "py-4"} sm:px-5`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                        {editing && onRename ? (
                            <RenameForm name={run.name} onSubmit={(name) => { onRename(name); closeRename(); }} onCancel={closeRename} />
                        ) : (
                            <div className="flex min-w-0 items-center gap-2">
                                <h2 className={`truncate font-semibold text-[var(--app-text)] ${compact ? "text-sm" : "text-base sm:text-lg"}`}>{runDisplayName(run)}</h2>
                                {onRename && (
                                    <button type="button" ref={renameButtonRef} onClick={() => setEditing(true)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]" aria-label="Đổi tên lượt tạo">
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                        )}
                        <p role="status" className="mt-1 text-xs text-[var(--app-text-secondary)]">
                            <span className={`font-semibold text-[var(--app-text)] ${compact ? "text-base" : "text-xl"}`}>{done.toLocaleString("vi-VN")}/{total.toLocaleString("vi-VN")}</span>
                            {" "}hoàn thành · {runStateLabel(run, remainingLocal)}{run.status === "active" && active > 0 ? ` · ${formatEta(run.etaSec)}` : ""}
                        </p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--app-surface-soft)]" aria-hidden="true">
                            <div className="h-full origin-left rounded-full bg-[var(--app-accent)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out" style={{ transform: `scaleX(${percent / 100})` }} />
                            {failedPercent > 0 && (
                                <div className="-mt-2 h-full origin-right rounded-full bg-[var(--app-danger)]/70 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out" style={{ transform: `scaleX(${failedPercent / 100})` }} />
                            )}
                        </div>
                        {!compact && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <Pill label="hoàn thành" value={run.counts.succeeded} tone="success" />
                                <Pill label="thất bại" value={run.counts.failed} tone="danger" />
                                <Pill label="đang tạo" value={run.counts.processing} tone="info" />
                                <Pill label="đang chờ" value={run.counts.pending + run.queuedOnServer + remainingLocal} tone="muted" />
                                {run.counts.cancelled > 0 && <Pill label="đã huỷ" value={run.counts.cancelled} tone="muted" />}
                                {run.retried > 0 && <Pill label="đã thử lại" value={run.retried} tone="muted" />}
                            </div>
                        )}
                        {run.pausedReason === "INSUFFICIENT_CREDITS" && (
                            <p role="alert" className="mt-2 text-xs font-medium text-[var(--app-warning)]">Tạm dừng: không đủ credit. Nạp thêm để máy chủ tự tiếp tục.</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                        {onCancelRemaining && run.status === "active" && active > 0 && (
                            <button type="button" onClick={onCancelRemaining} disabled={isBusy} className={`${ACTION} border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10`}>
                                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />Huỷ {active.toLocaleString("vi-VN")} job còn lại
                            </button>
                        )}
                        {onRetryFailed && run.counts.failed > 0 && run.status !== "cancelled" && (
                            <button type="button" onClick={onRetryFailed} disabled={isBusy} className={`${ACTION} border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]`}>
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Thử lại {run.counts.failed} job thất bại
                            </button>
                        )}
                        {onDownloadAll && run.counts.succeeded > 0 && (
                            <button type="button" onClick={onDownloadAll} className={`${ACTION} border-transparent bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)]`}>
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />Tải xuống {run.counts.succeeded.toLocaleString("vi-VN")} file
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
