import { Download, FastForward, Loader2, RefreshCw, XCircle } from "lucide-react";
import type { PortalTask } from "@/types/api";
import { isActiveTask, isVideoTask, STATUS_CLASS, STATUS_LABEL, taskAlt, taskErrorText, taskNumber, type RunTaskActions } from "./runTaskView";

const ICON_BUTTON = "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] disabled:opacity-40";

/** Hàng gọn cho lượt lớn (> 50 job): thumbnail 40 px, số thứ tự, prompt, trạng thái, hành động icon. */
export default function RunTaskRow({ task, actions, rowIndex }: { task: PortalTask; actions: RunTaskActions; rowIndex: number }) {
    const url = task.result?.url;
    const error = taskErrorText(task);
    return (
        <div role="row" aria-rowindex={rowIndex} className={`flex items-center gap-3 border-b border-[var(--app-border)] px-4 py-2 sm:px-5 ${task.status === "failed" ? "border-l-4 border-l-[var(--app-danger)]" : ""}`}>
            <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--app-surface-soft)]" aria-hidden="true">
                {url && task.status === "succeeded" ? (
                    isVideoTask(task) ? <video src={url} preload="none" muted className="h-full w-full object-cover" /> : <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : isActiveTask(task) ? (
                    <Loader2 className="h-4 w-4 text-[var(--app-text-muted)] motion-safe:animate-spin" />
                ) : null}
            </div>
            <span className="w-14 shrink-0 text-xs font-semibold text-[var(--app-text)]">#{taskNumber(task)}</span>
            <p className="min-w-0 flex-1 truncate text-xs text-[var(--app-text-secondary)]" title={task.prompt ?? undefined}>
                {task.prompt ?? "—"}
                {error && <span className="ml-2 text-[11px] text-[var(--app-danger)]">{error}</span>}
            </p>
            <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${STATUS_CLASS[task.status]}`}>{STATUS_LABEL[task.status]}</span>
            <div className="flex shrink-0 items-center gap-1">
                {task.status === "succeeded" && url && actions.onDownload && (
                    <button type="button" onClick={() => actions.onDownload?.(task)} className={ICON_BUTTON} aria-label={`Tải xuống ${taskAlt(task)}`}>
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
                {task.status === "succeeded" && isVideoTask(task) && task.result?.mediaId && actions.onExtend && (
                    <button type="button" onClick={() => actions.onExtend?.(task)} className={ICON_BUTTON} aria-label={`Tiếp tục video #${taskNumber(task)}`}>
                        <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
                {task.status === "failed" && actions.onRetry && (
                    <button type="button" onClick={() => actions.onRetry?.(task)} className={ICON_BUTTON} aria-label={`Thử lại job #${taskNumber(task)}`}>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
                {isActiveTask(task) && actions.onCancel && (
                    <button type="button" onClick={() => actions.onCancel?.(task)} className={`${ICON_BUTTON} border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10`} aria-label={`Huỷ job #${taskNumber(task)}`}>
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    );
}
