import { useState } from "react";
import type { MediaItem } from "../library.types";

export function useMediaSelection() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    function toggleMediaSelection(id: string) {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((itemId) => itemId !== id)
                : [...previous, id]
        );
    }

    function toggleSelectCurrentPage(items: MediaItem[]) {
        const visibleIds = items.map((item) => item.id);

        const allSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) => selectedIds.includes(id));

        setSelectedIds((previous) =>
            allSelected
                ? previous.filter((id) => !visibleIds.includes(id))
                : [...new Set([...previous, ...visibleIds])]
        );
    }

    function clearSelection() {
        setSelectedIds([]);
        setIsSelectionMode(false);
    }

    function startSelection() {
        setIsSelectionMode(true);
    }

    return {
        selectedIds,
        setSelectedIds,
        isSelectionMode,
        setIsSelectionMode,
        toggleMediaSelection,
        toggleSelectCurrentPage,
        clearSelection,
        startSelection,
    };
}
