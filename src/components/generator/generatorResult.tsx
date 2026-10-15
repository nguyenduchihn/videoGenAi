import {
    ArrowUpRight,
    CheckCircle2,
    Download,
    FastForward,
    Hourglass,
    Image as ImageIcon,
    Loader2,
    Play,
    RefreshCw,
    Video,
    XCircle,
} from "lucide-react";
import type { QueueNotice } from "@/features/generator/useBatchRunner";
import { getRatioPreviewClass } from "./ratioPreview";
import type { GeneratorResultItem, GeneratorResultStatus, GeneratorResultType } from "./types";

export type { GeneratorResultItem, GeneratorResultStatus, GeneratorResultType };

interface GeneratorResultProps {
    results: GeneratorResultItem[];
    queueNotice?: QueueNotice | null;
    onRetry?: (result: GeneratorResultItem) => void;
    onDownload?: (result: GeneratorResultItem) => void;
    onCancel?: (result: GeneratorResultItem) => void;
    onCancelAll?: () => void;
    onExtend?: (result: GeneratorResultItem) => void;
}

const SECONDARY_BUTTON = "flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]";
const isActive = (item: GeneratorResultItem) => item.status === "pending" || item.status === "processing";
const altOf = (result: GeneratorResultItem) => `Kết quả #${result.jobIndex}: ${result.prompt.slice(0, 80)}`;

function StatusBadge({ status }: { status: GeneratorResultStatus }) {
    if (status === "pending") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--app-text-secondary)]">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />Đang chờ
            </span>
        );
    }
    if (status === "processing") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />Đang tạo
            </span>
        );
    }
    if (status === "completed") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />Hoàn thành
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <XCircle className="h-3 w-3" aria-hidden="true" />Thất bại
        </span>
    );
}

function UpscaleBadge({ status }: { status: "done" | "failed" }) {
    return status === "done" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-info-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--app-info)]">
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />Đã upscale
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-warning-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--app-warning)]" title="Credit upscale đã được hoàn">
            <XCircle className="h-3 w-3" aria-hidden="true" />Upscale thất bại
        </span>
    );
}

function ResultPreview({ result }: { result: GeneratorResultItem }) {
    if (isActive(result)) {
        return (
            <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
                <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2 className="h-7 w-7 motion-safe:animate-spin" aria-hidden="true" />
                    <span className="text-xs">{result.status === "pending" ? "Đang chờ xử lý..." : "Đang tạo..."}</span>
                </div>
            </div>
        );
    }
    if (result.status === "failed") {
        return (
            <div className="flex aspect-video items-center justify-center bg-red-50 dark:bg-red-500/10">
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <XCircle className="h-7 w-7 text-red-400" aria-hidden="true" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Không thể tạo kết quả</span>
                    {result.error && <span className="max-w-full break-words text-[11px] text-red-400 dark:text-red-300">{result.error}</span>}
                </div>
            </div>
        );
    }
    if (result.url && result.type === "image") {
        return (
            <div className={`${getRatioPreviewClass(result.ratio)} overflow-hidden bg-[var(--app-surface-soft)]`}>
                <img src={result.url} alt={altOf(result)} className="h-full w-full object-contain" />
            </div>
        );
    }
    if (result.url) {
        return (
            <div className="aspect-video overflow-hidden bg-black">
                <video src={result.url} controls preload="metadata" aria-label={altOf(result)} className="h-full w-full object-contain" />
            </div>
        );
    }
    return (
        <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
            {result.type === "video" ? <Video className="h-8 w-8 text-[var(--app-text-muted)]" aria-hidden="true" /> : <ImageIcon className="h-8 w-8 text-[var(--app-text-muted)]" aria-hidden="true" />}
        </div>
    );
}

function ResultCard({ result, onRetry, onDownload, onCancel, onExtend }: { result: GeneratorResultItem } & Pick<GeneratorResultProps, "onRetry" | "onDownload" | "onCancel" | "onExtend">) {
    const canExtend = result.status === "completed" && result.type === "video" && Boolean(result.mediaId) && Boolean(onExtend);
    return (
        <li className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
            <ResultPreview result={result} />
            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--app-text)]">Job #{result.jobIndex}</p>
                        <p className="mt-1 truncate text-xs text-[var(--app-text-muted)]" title={result.prompt}>{result.prompt}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={result.status} />
                        {result.upscale && <UpscaleBadge status={result.upscale} />}
                    </div>
                </div>

                {isActive(result) && onCancel && (
                    <button type="button" onClick={() => onCancel(result)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />Hủy tạo
                    </button>
                )}

                {result.status === "completed" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {result.url && (
                            <button type="button" onClick={() => window.open(result.url, "_blank", "noopener")} className={SECONDARY_BUTTON}>
                                <Play className="h-3.5 w-3.5" aria-hidden="true" />Xem
                            </button>
                        )}
                        {onDownload && (
                            <button type="button" onClick={() => onDownload(result)} disabled={!result.url} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--app-accent)] px-3 py-2 text-xs font-medium text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)] disabled:text-[var(--app-text-muted)]">
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />Tải xuống
                            </button>
                        )}
                        {canExtend && (
                            <button type="button" onClick={() => onExtend?.(result)} className={`${SECONDARY_BUTTON} basis-full`}>
                                <FastForward className="h-3.5 w-3.5" aria-hidden="true" />Tiếp tục video
                            </button>
                        )}
                    </div>
                )}

                {result.status === "failed" && onRetry && (
                    <button type="button" onClick={() => onRetry(result)} className={`${SECONDARY_BUTTON} mt-4 w-full`}>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Thử lại
                    </button>
                )}
            </div>
        </li>
    );
}

export default function GeneratorResult({ results, queueNotice, onRetry, onDownload, onCancel, onCancelAll, onExtend }: GeneratorResultProps) {
    if (results.length === 0) return null;
    const count = (status: GeneratorResultStatus) => results.filter((item) => item.status === status).length;
    const completedCount = count("completed");
    const pendingCount = count("pending");
    const processingCount = count("processing");
    const failedCount = count("failed");
    const anyActive = pendingCount + processingCount > 0;

    return (
        <section className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors" aria-labelledby="generator-results-title">
            <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 id="generator-results-title" className="text-sm font-semibold text-[var(--app-text)]">Kết quả</h2>
                        <span className="rounded-full bg-[var(--app-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--app-text-secondary)]">{results.length} job</span>
                    </div>
                    <p aria-live="polite" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--app-text-muted)]">
                        {completedCount > 0 && <span>{completedCount} hoàn thành</span>}
                        {pendingCount > 0 && <span>{pendingCount} đang chờ</span>}
                        {processingCount > 0 && <span>{processingCount} đang tạo</span>}
                        {failedCount > 0 && <span>{failedCount} thất bại</span>}
                    </p>
                </div>
                {anyActive && onCancelAll && (
                    <button type="button" onClick={onCancelAll} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />Huỷ cả lô
                    </button>
                )}
            </div>

            {queueNotice && (
                <p role="status" className="flex items-center gap-2 border-b border-[var(--app-border)] bg-[var(--app-warning-soft)] px-4 py-2.5 text-xs font-medium text-[var(--app-warning)] sm:px-5">
                    <Hourglass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Hàng đợi đang đầy, tự gửi lại sau {queueNotice.seconds}s.
                </p>
            )}

            <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                {results.map((result) => (
                    <ResultCard key={result.id} result={result} onRetry={onRetry} onDownload={onDownload} onCancel={onCancel} onExtend={onExtend} />
                ))}
            </ul>
        </section>
    );
}
