import { useState } from "react";
import { Film, Image as ImageIcon, LoaderCircle } from "lucide-react";
import type { MediaKind, MediaSource, MediaItem } from "./library.types";
import { useLibraryMedia } from "./hooks/useLibraryMedia";
import { useMediaSelection } from "./hooks/useMediaSelection";
import { useMediaDownload } from "./hooks/useMediaDownload";
import LibraryGrid from "./components/libraryGrid";
import LibraryPagination from "./components/libraryPagination";
import MediaPreviewModal from "./components/mediaPreviewModal";
import LibraryToolbar from "./components/libraryToolbar";
import { useMediaDelete } from "./hooks/useMediaDelete";

const PAGE_SIZE = 12;

export default function LibraryPage() {
    const { media, loading, error, loadTasks } = useLibraryMedia();
    const [page, setPage] = useState(1);
    const [kind, setKind] = useState<MediaKind>("image");
    const [source, setSource] = useState<MediaSource>("all");
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const { selectedIds, isSelectionMode, toggleMediaSelection, toggleSelectCurrentPage, clearSelection, startSelection } = useMediaSelection();
    const { downloading, downloadMedia, downloadSelectedMedia } = useMediaDownload();
    const { deleteMedia, deletingId, error: deleteError, setError: setDeleteError } = useMediaDelete();


    const filtered = media.filter((item) => {
        return item.kind === kind &&
            (source === "all" || item.source === source);
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / PAGE_SIZE)
    );
    const currentPage = Math.min(page, totalPages);
    const visibleItems = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    function changeKind(value: MediaKind) {
        setKind(value);
        setPage(1);
        setSource("all");
        clearSelection();
    }

    function changeSource(value: MediaSource) {
        setSource(value);
        setPage(1);
        clearSelection();
    }

    function goToPage(value: number) {
        setPage(Math.max(1, Math.min(value, totalPages)));
    }


    async function handleDelete(item: MediaItem) {
        if (item.kind !== "image" || !item.imageId) {
            setDeleteError("Không tìm thấy ID ảnh hợp lệ để xóa.");
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa ảnh "${item.title}" không? Hành động này không thể hoàn tác.`,
        );

        if (!confirmed) return;

        setDeleteError("");

        const success = await deleteMedia(item);

        if (!success) return;

        setSelected((current) =>
            current?.id === item.id ? null : current,
        );

        clearSelection();
        await loadTasks();
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
                onRefresh={() => void loadTasks()}
                onToggleSelection={() => {
                    if (isSelectionMode) {
                        clearSelection();
                    } else {
                        startSelection();
                    }
                }}
                onSelectCurrentPage={() => toggleSelectCurrentPage(visibleItems)}
                onClearSelection={clearSelection}
                onDownloadSelected={() =>
                    void downloadSelectedMedia(filtered, selectedIds)
                }
            />
            <div className="mt-3 text-right text-sm text-[var(--app-text-secondary)]">
                {filtered.length} Tệp
            </div>


            {deleteError && (
                <p role="alert" className="text-sm text-red-600">
                    {deleteError}
                </p>
            )}


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
                        onClick={() => void loadTasks()}
                        className="rounded-lg bg-[var(--app-accent)] px-4 py-2 text-sm text-white"
                    >
                        Thử lại
                    </button>
                </div>
            ) : visibleItems.length === 0 ? (
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
                    items={visibleItems}
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
                    onDelete={(item) => void handleDelete(item)}
                    deletingId={deletingId}
                />
            )}

            <LibraryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
            />

            <MediaPreviewModal
                item={selected}
                onClose={() => setSelected(null)}
                onDownload={(item) => void downloadMedia(item)}
            />
        </main>
    );
}
