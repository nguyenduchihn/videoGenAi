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
}

export const EMPTY_ATTACHMENTS: GeneratorAttachments = {
    start: [],
    end: [],
    references: [],
    sources: [],
    voice: "",
};

export const VOICE_OPTIONS = [
    "achernar",
    "archid",
    "algenib",
    "algieba",
    "alnilam",
    "aoede",
    "autonoe",
    "callirrhoe",
    "charon",
    "despina",
    "enceladus",
    "erinome",
    "fenrir",
    "gacrux",
    "iapetus",
    "kore",
    "laomedeia",
    "leda",
    "orus",
    "puck",
    "pulcherrima",
    "rasalgethi",
    "sadachbia",
    "sadaltager",
    "schedar",
    "sulafat",
    "umbriel",
    "vindemiatrix",
    "zephyr",
    "zubenelgenubi",
] as const;

export type VoiceOption = (typeof VOICE_OPTIONS)[number];


export interface VoiceOptionInfo {
    id: VoiceOption;
    label: string;
    description: string;
}

export const VOICE_OPTIONS_INFO: VoiceOptionInfo[] = [
    { id: "achernar", label: "Achernar", description: "Giọng rõ ràng" },
    { id: "archid", label: "Archid", description: "Giọng chắc, rõ" },
    { id: "algenib", label: "Algenib", description: "Giọng trầm" },
    { id: "algieba", label: "Algieba", description: "Giọng ấm" },
    { id: "alnilam", label: "Alnilam", description: "Giọng mạnh mẽ" },
    { id: "aoede", label: "Aoede", description: "Giọng mềm mại" },
    { id: "autonoe", label: "Autonoe", description: "Giọng nhẹ nhàng" },
    { id: "callirrhoe", label: "Callirrhoe", description: "Giọng tự nhiên" },
    { id: "charon", label: "Charon", description: "Giọng rõ, chuyên nghiệp" },
    { id: "despina", label: "Despina", description: "Giọng dịu dàng" },
    { id: "enceladus", label: "Enceladus", description: "Giọng trầm ấm" },
    { id: "erinome", label: "Erinome", description: "Giọng mềm" },
    { id: "fenrir", label: "Fenrir", description: "Giọng năng động" },
    { id: "gacrux", label: "Gacrux", description: "Giọng sâu" },
    { id: "iapetus", label: "Iapetus", description: "Giọng rõ nét" },
    { id: "kore", label: "Kore", description: "Giọng chắc" },
    { id: "laomedeia", label: "Laomedeia", description: "Giọng sinh động" },
    { id: "leda", label: "Leda", description: "Giọng nhẹ" },
    { id: "orus", label: "Orus", description: "Giọng chắc khỏe" },
    { id: "puck", label: "Puck", description: "Giọng sôi nổi" },
    { id: "pulcherrima", label: "Pulcherrima", description: "Giọng biểu cảm" },
    { id: "rasalgethi", label: "Rasalgethi", description: "Giọng giàu cảm xúc" },
    { id: "sadachbia", label: "Sadachbia", description: "Giọng tự nhiên" },
    { id: "sadaltager", label: "Sadaltager", description: "Giọng trầm" },
    { id: "schedar", label: "Schedar", description: "Giọng ấm" },
    { id: "sulafat", label: "Sulafat", description: "Giọng mềm mại" },
    { id: "umbriel", label: "Umbriel", description: "Giọng sâu lắng" },
    { id: "vindemiatrix", label: "Vindemiatrix", description: "Giọng nhẹ nhàng" },
    { id: "zephyr", label: "Zephyr", description: "Giọng sáng" },
    { id: "zubenelgenubi", label: "Zubenelgenubi", description: "Giọng rõ ràng" },
];
