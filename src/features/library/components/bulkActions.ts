import type { MediaItem } from "../library.types";

export function getSelectedMedia(
    items: MediaItem[],
    selectedIds: string[],
): MediaItem[] {
    const selectedSet = new Set(selectedIds);
    return items.filter((item) => selectedSet.has(item.id));
}

export function getSelectionLabel(count: number): string {
    return `Đã chọn ${count} mục`;
}
