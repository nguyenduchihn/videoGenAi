
import { useState } from "react";
import { deleteImage } from "@/api/portal.api";
import type { MediaItem } from "../library.types";

export function useMediaDelete() {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function deleteMedia(item: MediaItem): Promise<boolean> {
        if (item.kind !== "image" || !item.imageId) {
            setError("Không tìm thấy ID ảnh hợp lệ để xóa.");
            return false;
        }

        setError("");
        setDeletingId(item.id);

        try {
            await deleteImage(item.imageId);
            return true;
        } catch (err) {
            console.error("Không thể xóa ảnh:", err);
            setError("Xóa ảnh thất bại. Vui lòng thử lại.");
            return false;
        } finally {
            setDeletingId(null);
        }
    }

    return { deleteMedia, deletingId, error, setError };
}
