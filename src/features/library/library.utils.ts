import type { PortalTask } from "@/types/api";
import type { MediaKind } from "./library.types";


export function getMediaKind(task: PortalTask): MediaKind | null {
    switch (task.worker) {
        case "text-to-image":
        case "image-to-image":
            return "image";

        case "text-to-video":
        case "image-to-video":
        case "reference-images-to-video":
        case "start-end-image-to-video":

        default:
            return null;
    }
}


export function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}