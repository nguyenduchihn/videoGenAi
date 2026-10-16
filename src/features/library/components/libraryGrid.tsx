
import type { MediaItem } from "../library.types";
import MediaCard from "./mediaCard";

interface LibraryGridProps {
    items: MediaItem[];
    isSelectionMode: boolean;
    selectedIds: string[];
    deletingId: string | null;
    onOpen: (item: MediaItem) => void;
    onDownload: (item: MediaItem) => void;
    onDelete: (item: MediaItem) => void;
}

export default function LibraryGrid({
    items,
    isSelectionMode,
    selectedIds,
    deletingId,
    onOpen,
    onDownload,
    onDelete,
}: LibraryGridProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
                <MediaCard
                    key={item.id}
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(item.id)}
                    isDeleting={deletingId === item.id}
                    onOpen={onOpen}
                    onDownload={onDownload}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
