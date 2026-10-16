import { Download, X } from "lucide-react";
import type { MediaItem } from "../library.types";
import { formatDate } from "../library.utils";

interface MediaPreviewModalProps {
    item: MediaItem | null;
    onClose: () => void;
    onDownload: (item: MediaItem) => void;
}

export default function MediaPreviewModal({
    item,
    onClose,
    onDownload,
}: MediaPreviewModalProps) {
    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Xem trước media"
                className="relative w-full max-w-5xl rounded-xl bg-[var(--app-surface)] p-4"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--app-text)]">
                            {item.title}
                        </p>
                        <p className="text-xs text-[var(--app-text-secondary)]">
                            {formatDate(item.createdAt)}
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => onDownload(item)}
                            title="Tải xuống"
                            aria-label="Tải xuống media"
                            className="rounded-lg p-2 text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
                        >
                            <Download size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            title="Đóng"
                            aria-label="Đóng cửa sổ xem trước"
                            className="rounded-lg p-2 text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {item.kind === "image" ? (
                    <img
                        src={item.url}
                        alt={item.title}
                        className="mx-auto max-h-[75vh] max-w-full rounded-lg object-contain"
                    />
                ) : (
                    <video
                        src={item.url}
                        controls
                        autoPlay
                        className="mx-auto max-h-[75vh] max-w-full rounded-lg"
                    />
                )}
            </div>
        </div>
    );
}
