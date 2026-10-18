import { Download, FastForward, Image as ImageIcon, Loader2, Maximize2, RefreshCw, Video, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getRatioPreviewClass } from "@/components/generator/ratioPreview";
import type { PortalTask } from "@/types/api";
import { ICON_BUTTON, ICON_BUTTON_PRIMARY, isActiveTask, isVideoTask, STATUS_CLASS, STATUS_LABEL, taskAlt, taskErrorText, taskNumber, type RunTaskActions } from "./runTaskView";

/** Nút có chữ, cao 32 px như nút icon (huỷ / thử lại). */
const TEXT_BUTTON = "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition";
const SECONDARY = `${TEXT_BUTTON} border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]`;
const DANGER = `${TEXT_BUTTON} border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10`;

/** Xem trước: ảnh (theo tỷ lệ) hoặc video; lỗi tải ⇒ "đã hết hạn — nhấn để làm mới". */
function Preview({
    task,
    ratio,
    onRefresh,
    onPreview,
}: {
    task: PortalTask;
    ratio?: string;
    onRefresh?: (task: PortalTask) => void;
    onPreview?: () => void;
}) {
    const [expired, setExpired] = useState(false);
    const url = task.result?.url;

    if (isActiveTask(task)) {
        return (
            <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
                <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2
                        className="h-7 w-7 motion-safe:animate-spin"
                        aria-hidden="true"
                    />
                    <span className="text-xs">
                        {task.status === "pending"
                            ? "Đang chờ xử lý..."
                            : "Đang tạo..."}
                    </span>
                </div>
            </div>
        );
    }

    if (task.status === "failed" || task.status === "cancelled") {
        const message = taskErrorText(task);

        return (
            <div
                className={`flex aspect-video items-center justify-center ${task.status === "failed"
                    ? "bg-[var(--app-danger-soft)]"
                    : "bg-[var(--app-surface-soft)]"
                    }`}
            >
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <XCircle
                        className={`h-7 w-7 ${task.status === "failed"
                            ? "text-[var(--app-danger)]"
                            : "text-[var(--app-text-muted)]"
                            }`}
                        aria-hidden="true"
                    />
                    <span
                        className={`text-xs font-medium ${task.status === "failed"
                            ? "text-[var(--app-danger)]"
                            : "text-[var(--app-text-muted)]"
                            }`}
                    >
                        {task.status === "failed"
                            ? "Không thể tạo kết quả"
                            : "Đã huỷ"}
                    </span>
                    {message && (
                        <span className="max-w-full break-words text-[11px] text-[var(--app-danger)]">
                            {message}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    if (!url || expired) {
        return (
            <button
                type="button"
                onClick={() => {
                    setExpired(false);
                    onRefresh?.(task);
                }}
                className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-[var(--app-surface-soft)] text-xs text-[var(--app-text-secondary)] transition hover:text-[var(--app-text)]"
            >
                {isVideoTask(task) ? (
                    <Video className="h-7 w-7" aria-hidden="true" />
                ) : (
                    <ImageIcon className="h-7 w-7" aria-hidden="true" />
                )}
                {url
                    ? "Xem trước đã hết hạn — nhấn để làm mới"
                    : "Chưa có xem trước"}
            </button>
        );
    }

    if (isVideoTask(task)) {
        return (
            <button
                type="button"
                onClick={onPreview}
                className="group relative block aspect-video w-full overflow-hidden bg-black"
                aria-label={`Phóng to ${taskAlt(task)}`}
                title="Nhấn để xem video lớn"
            >
                <video
                    src={url}
                    preload="metadata"
                    muted
                    playsInline
                    aria-label={taskAlt(task)}
                    onError={() => setExpired(true)}
                    className="h-full w-full object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <Maximize2 className="h-7 w-7" aria-hidden="true" />
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onPreview}
            className={`${getRatioPreviewClass(ratio)} group relative block w-full overflow-hidden bg-[var(--app-surface-soft)]`}
            aria-label={`Phóng to ${taskAlt(task)}`}
            title="Nhấn để xem ảnh lớn"
        >
            <img
                src={url}
                alt={taskAlt(task)}
                loading="lazy"
                decoding="async"
                onError={() => setExpired(true)}
                className="h-full w-full object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                <Maximize2 className="h-7 w-7" aria-hidden="true" />
            </span>
        </button>
    );
}

export default function RunTaskCard({
    task,
    ratio,
    actions,
}: {
    task: PortalTask;
    ratio?: string;
    actions: RunTaskActions;
}) {
    const [previewOpen, setPreviewOpen] = useState(false);

    const canExtend =
        task.status === "succeeded" &&
        isVideoTask(task) &&
        Boolean(task.result?.mediaId) &&
        Boolean(actions.onExtend);

    const url = task.result?.url;
    const n = taskNumber(task);

    useEffect(() => {
        if (!previewOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setPreviewOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [previewOpen]);

    useEffect(() => {
        if (!previewOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [previewOpen]);

    return (
        <article
            className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors"
            aria-label={`Job #${n}`}
        >
            <Preview
                key={url ?? task.id}
                task={task}
                ratio={ratio}
                onRefresh={actions.onRefresh}
                onPreview={() => setPreviewOpen(true)}
            />

            <div className="flex flex-1 flex-col p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--app-text)]">
                            Job #{n}
                        </p>
                        <p
                            className="mt-0.5 line-clamp-2 text-xs text-[var(--app-text-muted)]"
                            title={task.prompt ?? undefined}
                        >
                            {task.prompt ?? "—"}
                        </p>
                    </div>

                    <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[task.status]}`}
                    >
                        {isActiveTask(task) && (
                            <Loader2
                                className="h-3 w-3 motion-safe:animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        {STATUS_LABEL[task.status]}
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-end gap-1.5 pt-3">
                    {isActiveTask(task) && actions.onCancel && (
                        <button
                            type="button"
                            onClick={() => actions.onCancel?.(task)}
                            className={DANGER}
                        >
                            <XCircle
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Huỷ tạo
                        </button>
                    )}

                    {task.status === "succeeded" && canExtend && (
                        <button
                            type="button"
                            onClick={() => actions.onExtend?.(task)}
                            className={ICON_BUTTON}
                            aria-label={`Tiếp tục video #${n}`}
                            title="Tiếp tục video"
                        >
                            <FastForward
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                        </button>
                    )}

                    {task.status === "succeeded" && url && (
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className={ICON_BUTTON}
                            aria-label={`Phóng to ${taskAlt(task)}`}
                            title="Xem lớn"
                        >
                            <Maximize2
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                        </button>
                    )}

                    {task.status === "succeeded" && actions.onDownload && (
                        <button
                            type="button"
                            onClick={() => actions.onDownload?.(task)}
                            disabled={!url}
                            className={ICON_BUTTON_PRIMARY}
                            aria-label={`Tải xuống ${taskAlt(task)}`}
                            title="Tải xuống"
                        >
                            <Download
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                        </button>
                    )}

                    {task.status === "failed" && actions.onRetry && (
                        <button
                            type="button"
                            onClick={() => actions.onRetry?.(task)}
                            className={SECONDARY}
                        >
                            <RefreshCw
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Thử lại
                        </button>
                    )}
                </div>
            </div>

            {previewOpen && url && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Xem lớn ${taskAlt(task)}`}
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(false)}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        aria-label="Đóng xem trước"
                        title="Đóng"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <div
                        className="flex max-h-[90vh] max-w-[95vw] items-center justify-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {isVideoTask(task) ? (
                            <video
                                src={url}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-[85vh] max-w-[95vw] object-contain"
                                aria-label={taskAlt(task)}
                            />
                        ) : (
                            <img
                                src={url}
                                alt={taskAlt(task)}
                                className="max-h-[85vh] max-w-[95vw] object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </article>
    );
}