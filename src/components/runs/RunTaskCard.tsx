import { Download, FastForward, Image as ImageIcon, Loader2, Play, RefreshCw, Video, XCircle } from "lucide-react";
import { useState } from "react";
import { getRatioPreviewClass } from "@/components/generator/ratioPreview";
import type { PortalTask } from "@/types/api";
import { isActiveTask, isVideoTask, STATUS_CLASS, STATUS_LABEL, taskAlt, taskErrorText, taskNumber, type RunTaskActions } from "./runTaskView";

const SECONDARY = "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]";

/** Xem trước: ảnh (theo tỷ lệ) hoặc video; lỗi tải ⇒ "đã hết hạn — nhấn để làm mới". */
function Preview({ task, ratio, onRefresh }: { task: PortalTask; ratio?: string; onRefresh?: (task: PortalTask) => void }) {
    const [expired, setExpired] = useState(false);
    const url = task.result?.url;
    if (isActiveTask(task)) {
        return (
            <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
                <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2 className="h-7 w-7 motion-safe:animate-spin" aria-hidden="true" />
                    <span className="text-xs">{task.status === "pending" ? "Đang chờ xử lý..." : "Đang tạo..."}</span>
                </div>
            </div>
        );
    }
    if (task.status === "failed" || task.status === "cancelled") {
        const message = taskErrorText(task);
        return (
            <div className={`flex aspect-video items-center justify-center ${task.status === "failed" ? "bg-[var(--app-danger-soft)]" : "bg-[var(--app-surface-soft)]"}`}>
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <XCircle className={`h-7 w-7 ${task.status === "failed" ? "text-[var(--app-danger)]" : "text-[var(--app-text-muted)]"}`} aria-hidden="true" />
                    <span className={`text-xs font-medium ${task.status === "failed" ? "text-[var(--app-danger)]" : "text-[var(--app-text-muted)]"}`}>{task.status === "failed" ? "Không thể tạo kết quả" : "Đã huỷ"}</span>
                    {message && <span className="max-w-full break-words text-[11px] text-[var(--app-danger)]">{message}</span>}
                </div>
            </div>
        );
    }
    if (!url || expired) {
        return (
            <button type="button" onClick={() => { setExpired(false); onRefresh?.(task); }} className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-[var(--app-surface-soft)] text-xs text-[var(--app-text-secondary)] transition hover:text-[var(--app-text)]">
                {isVideoTask(task) ? <Video className="h-7 w-7" aria-hidden="true" /> : <ImageIcon className="h-7 w-7" aria-hidden="true" />}
                {url ? "Xem trước đã hết hạn — nhấn để làm mới" : "Chưa có xem trước"}
            </button>
        );
    }
    if (isVideoTask(task)) {
        return (
            <div className="aspect-video overflow-hidden bg-black">
                <video src={url} controls preload="metadata" aria-label={taskAlt(task)} onError={() => setExpired(true)} className="h-full w-full object-contain" />
            </div>
        );
    }
    return (
        <div className={`${getRatioPreviewClass(ratio)} overflow-hidden bg-[var(--app-surface-soft)]`}>
            <img src={url} alt={taskAlt(task)} loading="lazy" decoding="async" onError={() => setExpired(true)} className="h-full w-full object-contain" />
        </div>
    );
}

export default function RunTaskCard({ task, ratio, actions }: { task: PortalTask; ratio?: string; actions: RunTaskActions }) {
    const canExtend = task.status === "succeeded" && isVideoTask(task) && Boolean(task.result?.mediaId) && Boolean(actions.onExtend);
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors" aria-label={`Job #${taskNumber(task)}`}>
            <Preview key={task.result?.url ?? task.id} task={task} ratio={ratio} onRefresh={actions.onRefresh} />
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--app-text)]">Job #{taskNumber(task)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--app-text-muted)]" title={task.prompt ?? undefined}>{task.prompt ?? "—"}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_CLASS[task.status]}`}>
                        {isActiveTask(task) && <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />}
                        {STATUS_LABEL[task.status]}
                    </span>
                </div>
                <div className="mt-auto pt-4">
                    {isActiveTask(task) && actions.onCancel && (
                        <button type="button" onClick={() => actions.onCancel?.(task)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />Huỷ tạo
                        </button>
                    )}
                    {task.status === "succeeded" && (
                        <div className="flex flex-wrap gap-2">
                            {task.result?.url && (
                                <button type="button" onClick={() => window.open(task.result!.url!, "_blank", "noopener")} className={SECONDARY}>
                                    <Play className="h-3.5 w-3.5" aria-hidden="true" />Xem<span className="sr-only"> (mở tab mới)</span>
                                </button>
                            )}
                            {actions.onDownload && (
                                <button type="button" onClick={() => actions.onDownload?.(task)} disabled={!task.result?.url} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--app-accent)] px-3 py-2 text-xs font-medium text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)] disabled:text-[var(--app-text-muted)]">
                                    <Download className="h-3.5 w-3.5" aria-hidden="true" />Tải xuống
                                </button>
                            )}
                            {canExtend && (
                                <button type="button" onClick={() => actions.onExtend?.(task)} className={`${SECONDARY} basis-full`}>
                                    <FastForward className="h-3.5 w-3.5" aria-hidden="true" />Tiếp tục video
                                </button>
                            )}
                        </div>
                    )}
                    {task.status === "failed" && actions.onRetry && (
                        <button type="button" onClick={() => actions.onRetry?.(task)} className={`${SECONDARY} w-full`}>
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Thử lại
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
