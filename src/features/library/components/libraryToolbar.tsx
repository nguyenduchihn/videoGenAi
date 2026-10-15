import { Image as ImageIcon, Film, RefreshCw, CheckSquare, X, Download } from "lucide-react";

import type { MediaKind, MediaSource } from "../library.types";

interface LibraryToolbarProps {
    kind: MediaKind;
    source: MediaSource;
    isSelectionMode: boolean;
    selectedCount: number;
    downloading: boolean;
    onKindChange: (kind: MediaKind) => void;
    onSourceChange: (source: MediaSource) => void;
    onRefresh: () => void;
    onToggleSelection: () => void;
    onSelectCurrentPage: () => void;
    onClearSelection: () => void;
    onDownloadSelected: () => void;
}

export default function LibraryToolbar({
    kind,
    source,
    isSelectionMode,
    selectedCount,
    downloading,
    onKindChange,
    onSourceChange,
    onRefresh,
    onToggleSelection,
    onSelectCurrentPage,
    onClearSelection,
    onDownloadSelected,
}: LibraryToolbarProps) {
    const tabClass = (active: boolean) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active
            ? "bg-blue-600 text-white"
            : "text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
        }`;

    const sourceClass = (active: boolean) =>
        `rounded-full border px-3 py-1.5 text-sm transition ${active
            ? "border-blue-600 text-[var(--app-text)]"
            : "border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)]"
        }`;

    const actionClass =
        "inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-text)] transition hover:bg-[var(--app-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className={tabClass(kind === "image")}
                        onClick={() => onKindChange("image")}
                    >
                        <ImageIcon size={16} />
                        Hình ảnh
                    </button>

                    <button
                        type="button"
                        className={tabClass(kind === "video")}
                        onClick={() => onKindChange("video")}
                    >
                        <Film size={16} />
                        Video
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onRefresh}
                        className={actionClass}
                        disabled={downloading}
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </button>

                    <button
                        type="button"
                        onClick={onToggleSelection}
                        className={actionClass}
                    >
                        {isSelectionMode ? <X size={16} /> : <CheckSquare size={16} />}
                        {isSelectionMode ? "Hủy chọn" : "Chọn nhiều"}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {(
                        [
                            ["all", "Tất cả nguồn"],
                            ["generated", "Đã tạo"],
                            ["uploaded", "Đã tải lên"],
                        ] as const
                    ).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onSourceChange(value)}
                            aria-pressed={source === value}
                            className={sourceClass(source === value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {isSelectionMode && (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="text-sm text-[var(--app-text-secondary)]">
                            Đã chọn {selectedCount} mục
                        </span>

                        <button
                            type="button"
                            onClick={onSelectCurrentPage}
                            className={actionClass}
                        >
                            Chọn trang này
                        </button>

                        <button
                            type="button"
                            onClick={onClearSelection}
                            className={actionClass}
                        >
                            Bỏ chọn
                        </button>

                        <button
                            type="button"
                            disabled={selectedCount === 0 || downloading}
                            onClick={onDownloadSelected}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download size={16} />
                            {downloading ? "Đang tải..." : "Tải mục đã chọn"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
