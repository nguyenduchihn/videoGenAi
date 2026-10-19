import {
    ArrowLeftRight,
    Clapperboard,
    Film,
    ImagePlay,
    Images,
    Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TaskWorker, UpscaleResolution } from "@/types/api";

/** Mỗi chế độ trên portal = một worker backend (POST /v1/tasks). */
export type GeneratorMode = TaskWorker;
export type ModeKind = "image" | "video";
export type ImageRole = "start" | "end" | "references" | "sources";

export interface ModeRoles {
    start?: true;
    end?: true;
    references?: true;
    sources?: true;
    sourceVideo?: true;
    voice?: true;
}

export interface ModeSettings {
    ratio: boolean;
    duration: boolean;
    audio: boolean;
    seed: boolean;
}

export interface ModeSpec {
    value: GeneratorMode;
    kind: ModeKind;
    label: string;
    description: string;
    icon: LucideIcon;
    roles: ModeRoles;
    settings: ModeSettings;
}

// ⇐ giới hạn phía backend: libs/tasks/src/domain/workers.ts, create-batch.use-case.ts, images.controller.ts
export const OMNI_MODEL = "Veo_3.1-Omni";
/** Lane miễn phí theo gói: Google chỉ nhận 8 giây (backend: DURATION_NOT_SUPPORTED_FOR_MODEL). */
export const LOW_PRIORITY_MODEL = "Veo_3.1-Lite [Lower Priority]";
export const LOW_PRIORITY_DURATION = 8;
export const MAX_SOURCES = 10;
export const MAX_TASKS_PER_REQUEST = 20;
export const MAX_PROMPT_LENGTH = 4000;
export const SEED_MIN = 10_000;
export const SEED_MAX = 99_999;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const GOOGLE_SOFT_LIMIT_BYTES = 16 * 1024 * 1024;
export const IMAGE_TTL_HOURS = 24;
export const ACCEPTED_IMAGE_MIME: readonly string[] = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
export const ACCEPT_ATTR = ACCEPTED_IMAGE_MIME.join(",");
export const IMAGE_HANDLE_RE = /^[a-z][a-z0-9_-]{0,29}$/;
export const MENTION_RE = /(?:^|[^a-z0-9@])@([a-z][a-z0-9_-]{0,29})/gi;
export const VIDEO_DURATIONS = [4, 6, 8, 10] as const;

const VIDEO_SETTINGS: ModeSettings = { ratio: true, duration: true, audio: true, seed: false };
const IMAGE_SETTINGS: ModeSettings = { ratio: true, duration: false, audio: false, seed: false };

export const MODES: readonly ModeSpec[] = [
    {
        value: "text-to-image",
        kind: "image",
        label: "Văn bản → Ảnh",
        description: "Tạo ảnh từ mô tả",
        icon: Type,
        roles: {},
        settings: { ...IMAGE_SETTINGS, seed: true },
    },
    {
        value: "image-to-image",
        kind: "image",
        label: "Ảnh tham chiếu → Ảnh",
        description: "Giữ nhân vật, phong cách từ 1–10 ảnh",
        icon: Images,
        roles: { sources: true },
        settings: IMAGE_SETTINGS,
    },
    {
        value: "text-to-video",
        kind: "video",
        label: "Văn bản → Video",
        description: "Tạo video từ mô tả",
        icon: Clapperboard,
        roles: {},
        settings: VIDEO_SETTINGS,
    },
    {
        value: "image-to-video",
        kind: "video",
        label: "Khung đầu → Video",
        description: "Video bắt đầu từ 1 ảnh",
        icon: ImagePlay,
        roles: { start: true },
        settings: VIDEO_SETTINGS,
    },
    {
        value: "start-end-image-to-video",
        kind: "video",
        label: "Khung đầu + cuối → Video",
        description: "AI tạo chuyển động giữa 2 khung",
        icon: ArrowLeftRight,
        roles: { start: true, end: true },
        settings: VIDEO_SETTINGS,
    },
    {
        value: "reference-images-to-video",
        kind: "video",
        label: "Ảnh tham chiếu → Video",
        description: "1–3 ảnh (Omni tới 7) + giọng tuỳ chọn",
        icon: Film,
        roles: { references: true, voice: true },
        settings: VIDEO_SETTINGS,
    },
];

const MODE_BY_VALUE: ReadonlyMap<GeneratorMode, ModeSpec> = new Map(MODES.map((spec) => [spec.value, spec]));

export function modeSpec(mode: GeneratorMode): ModeSpec {
    const spec = MODE_BY_VALUE.get(mode);
    if (!spec) throw new Error(`Chế độ không hợp lệ: ${mode}`);
    return spec;
}

export const isGeneratorMode = (value: string): value is GeneratorMode => MODE_BY_VALUE.has(value as GeneratorMode);
export const isVideoMode = (mode: GeneratorMode): boolean => modeSpec(mode).kind === "video";
export const isImageMode = (mode: GeneratorMode): boolean => modeSpec(mode).kind === "image";
export const modesOfKind = (kind: ModeKind): ModeSpec[] => MODES.filter((spec) => spec.kind === kind);

export const maxReferences = (model: string): number => (model === OMNI_MODEL ? 7 : 3);
export const defaultRatio = (kind: ModeKind): string => (kind === "image" ? "1:1" : "16:9");
export const upscaleOptions = (kind: ModeKind): UpscaleResolution[] => (kind === "image" ? ["2K", "4K"] : ["1080P", "4K"]);

/** Omni không hỗ trợ khung đầu + cuối (backend từ chối). */
export const isModelAllowedFor = (mode: GeneratorMode, model: string): boolean =>
    !(mode === "start-end-image-to-video" && model === OMNI_MODEL);

export const isValidHandle = (handle: string): boolean => IMAGE_HANDLE_RE.test(handle);

/** `@tên` trong prompt (không tính email `a@b`), chữ thường, không trùng. */
export function extractMentions(prompt: string): string[] {
    const found = new Set<string>();
    for (const match of prompt.matchAll(MENTION_RE)) {
        const handle = match[1];
        if (handle) found.add(handle.toLowerCase());
    }
    return [...found];
}
