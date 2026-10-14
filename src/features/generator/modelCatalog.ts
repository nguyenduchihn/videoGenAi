import type { GeneratorMode } from "@/components/generator/types";
import type { V1ModelEntry, V1Models } from "@/types/api";

/** Danh mục model từ GET /v1/models; trước khi tải xong dùng STATIC_FALLBACK. */
export type ModelCatalog = V1Models;

export interface ModelOption {
    value: string;
    label: string;
    description: string;
    credits: string;
}

export const STATIC_FALLBACK: ModelCatalog = {
    video: [{ model: "Veo_3.1-Lite", family: "veo", default: true, credits: 5 }],
    image: [{ model: "Nano_Banana_2_Lite", family: "nano-banana", default: true, credits: 1 }],
};

const IMAGE_MODES: ReadonlySet<GeneratorMode> = new Set(["text-to-image", "batch-image"]);

function entriesFor(catalog: ModelCatalog, mode: GeneratorMode): V1ModelEntry[] {
    return IMAGE_MODES.has(mode) ? catalog.image : catalog.video;
}

function toLabel(model: string): string {
    return model.replace(/[_-]+/g, " ");
}

function creditsLabel(credits: number | null): string {
    if (credits === null) return "Giá theo worker";
    return `${credits} credit${credits === 1 ? "" : "s"}`;
}

export function getModelOptions(catalog: ModelCatalog, mode: GeneratorMode): ModelOption[] {
    const isImage = IMAGE_MODES.has(mode);
    return entriesFor(catalog, mode).map((entry) => ({
        value: entry.model,
        label: toLabel(entry.model),
        description: entry.note ?? (isImage ? "Tạo ảnh nhanh với chất lượng cao" : "Tạo video nhanh, tối ưu chi phí"),
        credits: creditsLabel(entry.credits),
    }));
}

export function getDefaultModel(catalog: ModelCatalog, mode: GeneratorMode): string {
    const entries = entriesFor(catalog, mode);
    const chosen = entries.find((entry) => entry.default) ?? entries[0];
    return chosen?.model ?? (IMAGE_MODES.has(mode) ? "Nano_Banana_2_Lite" : "Veo_3.1-Lite");
}

export function getCreditCost(catalog: ModelCatalog, model: string): number {
    return [...catalog.video, ...catalog.image].find((entry) => entry.model === model)?.credits ?? 0;
}
