import { Film, Image } from "lucide-react";
import { createElement } from "react";
import type { ReactNode } from "react";

export const WORKER_LABELS: Record<string, string> = {
    "text-to-video": "Văn bản → Video",
    "image-to-video": "Ảnh → Video",
    "reference-images-to-video": "Ảnh tham chiếu → Video",
    "start-end-image-to-video": "Khung đầu/cuối → Video",
    "text-to-image": "Văn bản → Ảnh",
    "image-to-image": "Ảnh → Ảnh",
};

export const VIDEO_WORKERS: ReadonlySet<string> = new Set([
    "text-to-video",
    "image-to-video",
    "reference-images-to-video",
    "start-end-image-to-video",
]);

export function workerLabel(worker: string): string {
    return WORKER_LABELS[worker] ?? worker;
}

export function workerIcon(worker: string, className = "h-4 w-4"): ReactNode {
    return createElement(VIDEO_WORKERS.has(worker) ? Film : Image, { className, "aria-hidden": true });
}
