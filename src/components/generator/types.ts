import type { GeneratorMode } from "@/features/generator/modes";

export type { GeneratorMode };

export type PromptSplitMode =
    | "newline"
    | "blank-line"
    | "separator"
    | "custom";

export type VideoDuration = 4 | 6 | 8 | 10;

export type UpscaleChoice = "none" | "2K" | "4K" | "1080P";

export interface GeneratorSettingsState {
    model: string;
    duration: VideoDuration;
    audioEnabled: boolean;
    upscale: UpscaleChoice;
    /** null = để Google chọn ngẫu nhiên (chỉ text-to-image). */
    seed: number | null;
    customSeparator: string;
}

/** Ảnh khách chọn trong form; chưa upload cho tới khi bấm Tạo. */
export interface AttachedImage {
    localId: string;
    file: File;
    previewUrl: string;
    /** `@handle` để nhắc trong prompt; "" = không đặt. */
    handle: string;
    /** Cảnh báo mềm (vd ảnh > 16 MiB có thể bị Google từ chối). */
    warning?: string;
}

export interface GeneratorAttachments {
    start: AttachedImage[];
    end: AttachedImage[];
    references: AttachedImage[];
    sources: AttachedImage[];
    /** `params.audio` của reference-images-to-video. */
    voice: string;
    /** extend-video: `result.mediaId` của video đã tạo. */
    sourceMediaId: string | null;
    sourceLabel: string | null;
}

export const EMPTY_ATTACHMENTS: GeneratorAttachments = {
    start: [],
    end: [],
    references: [],
    sources: [],
    voice: "",
    sourceMediaId: null,
    sourceLabel: null,
};

export type GeneratorResultStatus = "pending" | "processing" | "completed" | "failed";

export type GeneratorResultType = "video" | "image";

/** Một thẻ trong khu Kết quả: placeholder trước khi có task id, rồi bám theo task backend. */
export interface GeneratorResultItem {
    id: string;
    jobIndex: number;
    prompt: string;
    status: GeneratorResultStatus;
    type: GeneratorResultType;
    worker: string;
    batchId?: string;
    url?: string;
    mediaId?: string;
    ratio?: string;
    upscale?: "done" | "failed";
    error?: string;
}
