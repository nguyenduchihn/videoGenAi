import { useState } from "react";
import type { MediaItem } from "../library.types";

export function useMediaDownload() {
    const [downloading, setDownloading] = useState(false);

    async function downloadMedia(item: MediaItem): Promise<boolean> {
        try {
            if (!item.url) {
                throw new Error("Tệp không có URL");
            }

            const anchor = document.createElement("a");
            anchor.href = item.url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.download = "";

            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            return true;
        } catch (error) {
            console.error("Không thể mở tệp:", item.url, error);
            return false;
        }
    }

    async function downloadSelectedMedia(
        items: MediaItem[],
        selectedIds: string[]
    ) {
        const selectedItems = items.filter((item) =>
            selectedIds.includes(item.id)
        );

        if (selectedItems.length === 0 || downloading) return;

        setDownloading(true);

        try {
            for (const item of selectedItems) {
                const response = await fetch(item.url);

                if (!response.ok) {
                    throw new Error(`Không tải được tệp: ${item.title}`);
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                try {
                    const extension =
                        blob.type.includes("video")
                            ? "mp4"
                            : blob.type.includes("png")
                                ? "png"
                                : blob.type.includes("webp")
                                    ? "webp"
                                    : blob.type.includes("jpeg")
                                        ? "jpg"
                                        : "bin";

                    const prefix = item.kind === "video" ? "video-ai" : "anh-ai";
                    const filename = `${prefix}-${item.id.slice(0, 8)}.${extension}`;

                    const link = document.createElement("a");
                    link.href = objectUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    await new Promise((resolve) => setTimeout(resolve, 300));
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }
            }
        } catch (error) {
            console.error("Lỗi tải tệp:", error);
            alert(
                "Không thể tải một hoặc nhiều tệp. Hãy kiểm tra Console và quyền truy cập URL ảnh."
            );
        } finally {
            setDownloading(false);
        }
    }

    return {
        downloading,
        downloadMedia,
        downloadSelectedMedia,
    };
}
