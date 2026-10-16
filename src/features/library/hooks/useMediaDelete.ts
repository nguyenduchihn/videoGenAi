import { useState } from "react";
import { deleteImage } from "@/api/portal.api";
import type { MediaItem } from "../library.types";

export function useMediaDelete() {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function deleteMedia(item: MediaItem): Promise<boolean> {
        setError("");

        if (item.kind === "video") {
            setError("API xóa video AI chưa được tích hợp.");
            return false;
        }

        if (!item.imageId) {
            setError("Không tìm thấy ID ảnh hợp lệ để xóa.");
            return false;
        }

        if (item.source === "generated") {
            setError("API xóa ảnh AI chưa được tích hợp.");
            return false;
        }

        setDeletingId(item.id);

        try {
            await deleteImage(item.imageId);
            return true;
        } catch (err) {
            console.error("Không thể xóa ảnh upload:", err);
            setError("Xóa ảnh thất bại. Vui lòng thử lại.");
            return false;
        } finally {
            setDeletingId(null);
        }
    }

    return {
        deleteMedia,
        deletingId,
        error,
        setError,
    };
}