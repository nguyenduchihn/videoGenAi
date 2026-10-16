import { useEffect, useState } from "react";
import { Film, Image as ImageIcon, LoaderCircle } from "lucide-react";
import { useInView } from "@/components/media";
import type { MediaKind, MediaSource, MediaItem } from "./library.types";
import { useLibraryMedia } from "./hooks/useLibraryMedia";
import { useMediaSelection } from "./hooks/useMediaSelection";
import { useMediaDownload } from "./hooks/useMediaDownload";
import LibraryGrid from "./components/libraryGrid";
import MediaPreviewModal from "./components/mediaPreviewModal";
import LibraryToolbar from "./components/libraryToolbar";

/** Dưới ngưỡng này mà API còn trang ⇒ tự lấy thêm (vd lọc "video" nhưng 50 task đầu toàn ảnh). */
const MIN_VISIBLE = 12;

export default function LibraryPage() {
    const { media, loading, error, loadTasks, hasMore, loadingMore, loadMore } = useLibraryMedia();
    const [kind, setKind] = useState<MediaKind>("image");
    const [source, setSource] = useState<MediaSource>("all");
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const { selectedIds, isSelectionMode, toggleMediaSelection, toggleSelectCurrentPage, clearSelection, startSelection } = useMediaSelection();
    const { downloading, downloadMedia, downloadSelectedMedia } = useMediaDownload();
    // Mốc cuối lưới: cuộn tới (trước 600 px) ⇒ lấy trang kế; media trong thẻ vẫn chỉ tải khi từng thẻ vào khung nhìn.
    const [sentinelRef, sentinelInView] = useInView<HTMLDivElement>({ rootMargin: "600px 0px", once: false });

    const filtered = media.filter((item) => item.kind === kind && (source === "all" || item.source === source));

    useEffect(() => {
        if (!loading && hasMore && !loadingMore && (sentinelInView || filtered.length < MIN_VISIBLE)) loadMore();
    }, [loading, hasMore, loadingMore, sentinelInView, filtered.length, loadMore]);

    function changeKind(value: MediaKind) {
        setKind(value);
        setSource("all");
        clearSelection();
    }

    function changeSource(value: MediaSource) {
        setSource(value);
        clearSelection();
    }

    return (
        <main className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
            <LibraryToolbar
                kind={kind}
                source={source}
                isSelectionMode={isSelectionMode}
                selectedCount={selectedIds.length}
                downloading={downloading}
                onKindChange={changeKind}
                onSourceChange={changeSource}
                onRefresh={loadTasks}
                onToggleSelection={() => {
                    if (isSelectionMode) {
                        clearSelection();
                    } else {
                        startSelection();
                    }
                }}
                onSelectCurrentPage={() => toggleSelectCurrentPage(filtered)}
                onClearSelection={clearSelection}
                onDownloadSelected={() =>
                    void downloadSelectedMedia(filtered, selectedIds)
                }
            />
            <div className="mt-3 text-right text-sm text-[var(--app-text-secondary)]" aria-live="polite">
                {filtered.length} tệp{hasMore ? " · cuộn xuống để tải thêm" : ""}
            </div>

            {loading ? (
                <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--app-text-secondary)]">
                    <LoaderCircle className="animate-spin" size={20} />
                    Đang tải thư viện...
                </div>
            ) : error ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        type="button"
                        onClick={loadTasks}
                        className="rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm text-white"
                    >
                        Thử lại
                    </button>
                </div>
            ) : filtered.length === 0 && !hasMore ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--app-border)] text-center">
                    {kind === "image" ? (
                        <ImageIcon size={32} className="text-[var(--app-text-muted)]" />
                    ) : (
                        <Film size={32} className="text-[var(--app-text-muted)]" />
                    )}
                    <p className="font-medium text-[var(--app-text)]">
                        Chưa có {kind === "image" ? "hình ảnh" : "video"} phù hợp
                    </p>
                    <p className="text-sm text-[var(--app-text-secondary)]">
                        Các kết quả tạo thành công sẽ xuất hiện tại đây.
                    </p>
                </div>
            ) : (
                <LibraryGrid
                    items={filtered}
                    isSelectionMode={isSelectionMode}
                    selectedIds={selectedIds}
                    onOpen={(item) => {
                        if (isSelectionMode) {
                            toggleMediaSelection(item.id);
                        } else {
                            setSelected(item);
                        }
                    }}
                    onDownload={(item) => void downloadMedia(item)}
                />
            )}

            <div ref={sentinelRef} className="flex min-h-10 items-center justify-center text-sm text-[var(--app-text-secondary)]" aria-busy={loadingMore}>
                {loadingMore ? (
                    <span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} aria-hidden="true" />Đang tải thêm...</span>
                ) : hasMore ? (
                    <button type="button" onClick={loadMore} className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]">
                        Tải thêm
                    </button>
                ) : null}
            </div>

            <MediaPreviewModal
                item={selected}
                onClose={() => setSelected(null)}
                onDownload={(item) => void downloadMedia(item)}
            />
        </main>
    );
}
