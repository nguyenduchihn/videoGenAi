
export type MediaKind = "image" | "video";

export type MediaSource = "all" | "uploaded" | "generated";

export interface MediaItem {
    id: string;
    url: string;
    kind: MediaKind;
    source: MediaSource;
    title: string;
    createdAt: string;

    imageId?: string;
}
