import { Check, Download, Play, Trash2 } from "lucide-react";
import { LazyImage, LazyVideo } from "@/components/media";

import type { MediaItem } from "../library.types";
import { formatDate } from "../library.utils";

interface MediaCardProps {
    item: MediaItem;
    isSelectionMode: boolean;
    isSelected: boolean;
    isDeleting: boolean;
    onOpen: (item: MediaItem) => void;
    onDownload: (item: MediaItem) => void;
    onDelete: (item: MediaItem) => void;
}

export default function MediaCard({
    item,
    isSelectionMode,
    isSelected,
    isDeleting,
    onOpen,
    onDownload,
    onDelete,
}: MediaCardProps) {
    const sourceLabel =
        item.source === "uploaded" ? "Đã tải lên" : "AI tạo";

    return (
        <article className="group overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
            <button
                type="button"
                onClick={() => onOpen(item)}
                disabled={isDeleting}
                className="relative block aspect-square w-full overflow-hidden bg-[var(--app-surface-soft)] disabled:cursor-wait"
                aria-label={
                    isSelectionMode
                        ? `Chọn ${item.title}`
                        : `Xem trước ${item.title}`
                }
            >
                {item.kind === "image" ? (
                    <LazyImage
                        src={item.url}
                        alt={item.title}
                        className="object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <>
                        <LazyVideo
                            src={item.url}
                            muted
                            className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                            <Play size={34} fill="currentColor" />
                        </span>
                    </>
                )}

                {isSelectionMode && (
                    <span
                        className={`absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md border shadow-sm ${isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-white bg-white/95 text-transparent"
                            }`}
                    >
                        <Check size={15} strokeWidth={2.5} />
                    </span>
                )}
            </button>

            <div className="space-y-2 p-2.5 sm:p-3">
                <p
                    className="truncate text-sm font-medium text-[var(--app-text)]"
                    title={item.title}
                >
                    {item.title}
                </p>

                <div className="flex items-center justify-between gap-2">
                    <span
                        className="min-w-0 truncate text-xs text-[var(--app-text-secondary)]"
                        title={formatDate(item.createdAt)}
                    >
                        {formatDate(item.createdAt)}
                    </span>

                    <span className="shrink-0 rounded-md bg-[var(--app-surface-soft)] px-2 py-1 text-[10px] text-[var(--app-text-secondary)]">
                        {sourceLabel}
                    </span>
                </div>

                <div className="flex items-center justify-end gap-1 border-t border-[var(--app-border)] pt-2">
                    <button
                        type="button"
                        title="Tải xuống"
                        aria-label={`Tải xuống ${item.title}`}
                        onClick={() => onDownload(item)}
                        disabled={isDeleting}
                        className="rounded-md p-2 text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download size={16} />
                    </button>

                    <button
                        type="button"
                        title={isDeleting ? "Đang xóa..." : "Xóa"}
                        aria-label={`Xóa ${item.title}`}
                        disabled={isDeleting}
                        onClick={() => onDelete(item)}
                        className="rounded-md p-2 text-[var(--app-text-secondary)] hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}