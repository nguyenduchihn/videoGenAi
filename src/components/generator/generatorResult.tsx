import {
    CheckCircle2,
    Download,
    Image as ImageIcon,
    Loader2,
    Play,
    RefreshCw,
    Video,
    XCircle,
} from "lucide-react";

export type GeneratorResultStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed";

export type GeneratorResultType =
    | "video"
    | "image";

export interface GeneratorResultItem {
    id: string;
    jobIndex: number;
    prompt: string;
    status: GeneratorResultStatus;
    type: GeneratorResultType;
    batchId?: string;
    url?: string;
    thumbnail?: string;
    error?: string;
}

interface GeneratorResultProps {
    results: GeneratorResultItem[];
    onRetry?: (
        result: GeneratorResultItem,
    ) => void;
    onDownload?: (
        result: GeneratorResultItem,
    ) => void;
    onCancel?: (
        result: GeneratorResultItem,
    ) => void;
}

function StatusBadge({
    status,
}: {
    status: GeneratorResultStatus;
}) {
    if (status === "pending") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--app-text-secondary)]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Đang chờ
            </span>
        );
    }

    if (status === "processing") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Đang tạo
            </span>
        );
    }

    if (status === "completed") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Hoàn thành
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Thất bại
        </span>
    );
}

function ResultPreview({
    result,
}: {
    result: GeneratorResultItem;
}) {
    if (
        result.status === "pending" ||
        result.status === "processing"
    ) {
        return (
            <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
                <div className="flex flex-col items-center gap-2 text-[var(--app-text-muted)]">
                    <Loader2 className="h-7 w-7 animate-spin" />

                    <span className="text-xs">
                        {result.status === "pending"
                            ? "Đang chờ xử lý..."
                            : "Đang tạo..."}
                    </span>
                </div>
            </div>
        );
    }

    if (result.status === "failed") {
        return (
            <div className="flex aspect-video items-center justify-center bg-red-50 dark:bg-red-500/10">
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <XCircle className="h-7 w-7 text-red-400" />

                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        Không thể tạo kết quả
                    </span>

                    {result.error && (
                        <span className="max-w-full break-words text-[11px] text-red-400 dark:text-red-300">
                            {result.error}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    if (result.url) {
        if (result.type === "image") {
            return (
                <div className="aspect-video overflow-hidden bg-[var(--app-surface-soft)]">
                    <img
                        src={result.url}
                        alt={`Result ${result.jobIndex}`}
                        className="h-full w-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className="aspect-video overflow-hidden bg-black">
                <video
                    src={result.url}
                    controls
                    preload="metadata"
                    className="h-full w-full object-contain"
                />
            </div>
        );
    }

    if (result.thumbnail) {
        return (
            <div className="relative aspect-video overflow-hidden bg-[var(--app-surface-soft)]">
                <img
                    src={result.thumbnail}
                    alt={`Result ${result.jobIndex}`}
                    className="h-full w-full object-cover"
                />

                {result.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                            <Play
                                className="ml-0.5 h-4 w-4 fill-current"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex aspect-video items-center justify-center bg-[var(--app-surface-soft)]">
            {result.type === "video" ? (
                <Video className="h-8 w-8 text-[var(--app-text-muted)]" />
            ) : (
                <ImageIcon className="h-8 w-8 text-[var(--app-text-muted)]" />
            )}
        </div>
    );
}

function ResultCard({
    result,
    onRetry,
    onDownload,
    onCancel,
}: {
    result: GeneratorResultItem;
    onRetry?: (
        result: GeneratorResultItem,
    ) => void;
    onDownload?: (
        result: GeneratorResultItem,
    ) => void;
    onCancel?: (
        result: GeneratorResultItem,
    ) => void;
}) {
    const handleView = () => {
        if (!result.url) {
            return;
        }

        window.open(
            result.url,
            "_blank",
        );
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
            <ResultPreview result={result} />

            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--app-text)]">
                            Job #{result.jobIndex}
                        </p>

                        <p className="mt-1 truncate text-xs text-[var(--app-text-muted)]">
                            {result.prompt}
                        </p>
                    </div>

                    <StatusBadge
                        status={result.status}
                    />
                </div>

                {(result.status === "pending" ||
                    result.status === "processing") &&
                    onCancel && (
                        <button
                            type="button"
                            onClick={() =>
                                onCancel(result)
                            }
                            className="
                                mt-4
                                flex w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-red-200
                                px-3 py-2
                                text-xs
                                font-medium
                                text-red-600
                                transition
                                hover:bg-red-50
                                dark:border-red-500/30
                                dark:text-red-400
                                dark:hover:bg-red-500/10
                            "
                        >
                            <XCircle className="h-3.5 w-3.5" />
                            Hủy tạo
                        </button>
                    )}

                {result.status === "completed" && (
                    <div className="mt-4 flex gap-2">
                        {result.url && (
                            <button
                                type="button"
                                onClick={handleView}
                                className="
                                    flex flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-[var(--app-border)]
                                    px-3 py-2
                                    text-xs
                                    font-medium
                                    text-[var(--app-text-secondary)]
                                    transition
                                    hover:bg-[var(--app-surface-soft)]
                                    hover:text-[var(--app-text)]
                                "
                            >
                                <Play className="h-3.5 w-3.5" />
                                Xem
                            </button>
                        )}

                        {onDownload && (
                            <button
                                type="button"
                                onClick={() =>
                                    onDownload(result)
                                }
                                disabled={!result.url}
                                className="
                                    flex flex-1
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-[var(--app-accent)]
                                    px-3 py-2
                                    text-xs
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-[var(--app-accent-hover)]
                                    disabled:cursor-not-allowed
                                    disabled:bg-[var(--app-surface-soft)]
                                    disabled:text-[var(--app-text-muted)]
                                "
                            >
                                <Download className="h-3.5 w-3.5" />
                                Tải xuống
                            </button>
                        )}
                    </div>
                )}

                {result.status === "failed" &&
                    onRetry && (
                        <button
                            type="button"
                            onClick={() =>
                                onRetry(result)
                            }
                            className="
                                mt-4
                                flex w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-[var(--app-border)]
                                px-3 py-2
                                text-xs
                                font-medium
                                text-[var(--app-text-secondary)]
                                transition
                                hover:bg-[var(--app-surface-soft)]
                                hover:text-[var(--app-text)]
                            "
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Thử lại
                        </button>
                    )}
            </div>
        </div>
    );
}

export default function GeneratorResult({
    results,
    onRetry,
    onDownload,
    onCancel,
}: GeneratorResultProps) {
    if (results.length === 0) {
        return null;
    }

    const completedCount =
        results.filter(
            (item) =>
                item.status === "completed",
        ).length;

    const pendingCount =
        results.filter(
            (item) =>
                item.status === "pending",
        ).length;

    const processingCount =
        results.filter(
            (item) =>
                item.status === "processing",
        ).length;

    const failedCount =
        results.filter(
            (item) =>
                item.status === "failed",
        ).length;

    return (
        <section className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
            <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[var(--app-text)]">
                            Kết quả
                        </h2>

                        <span className="rounded-full bg-[var(--app-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--app-text-secondary)]">
                            {results.length} Jobs
                        </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--app-text-muted)]">
                        {completedCount > 0 && (
                            <span>
                                {completedCount} hoàn thành
                            </span>
                        )}

                        {pendingCount > 0 && (
                            <span>
                                {pendingCount} đang chờ
                            </span>
                        )}

                        {processingCount > 0 && (
                            <span>
                                {processingCount} đang tạo
                            </span>
                        )}

                        {failedCount > 0 && (
                            <span>
                                {failedCount} thất bại
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                {results.map((result) => (
                    <ResultCard
                        key={result.id}
                        result={result}
                        onRetry={onRetry}
                        onDownload={onDownload}
                        onCancel={onCancel}
                    />
                ))}
            </div>
        </section>
    );
}