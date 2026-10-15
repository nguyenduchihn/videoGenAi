import type { V1ModelEntry, V1Models } from "@/types/api";
import { isModelAllowedFor, modeSpec, type GeneratorMode } from "./modes";

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
    image: [{ model: "Nano_Banana_Pro", family: "nano-banana", default: true, credits: 1 }],
};

function entriesFor(catalog: ModelCatalog, mode: GeneratorMode): V1ModelEntry[] {
    return modeSpec(mode).kind === "image" ? catalog.image : catalog.video;
}

/** `Veo_3.1-Lite` ⇒ `Veo 3.1 Lite`. */
export function toLabel(model: string): string {
    return model.replace(/[_-]+/g, " ");
}

function creditsLabel(credits: number | null): string {
    if (credits === null) return "Giá theo worker";
    return `${credits} credit${credits === 1 ? "" : "s"}`;
}

/** Model hợp lệ cho chế độ (ảnh/video; Omni bị loại ở Khung đầu + cuối). */
export function getModelOptions(catalog: ModelCatalog, mode: GeneratorMode): ModelOption[] {
    const isImage = modeSpec(mode).kind === "image";
    return entriesFor(catalog, mode)
        .filter((entry) => isModelAllowedFor(mode, entry.model))
        .map((entry) => ({
            value: entry.model,
            label: toLabel(entry.model),
            description: entry.note ?? (isImage ? "Tạo ảnh nhanh với chất lượng cao" : "Tạo video nhanh, tối ưu chi phí"),
            credits: creditsLabel(entry.credits),
        }));
}

export function getDefaultModel(catalog: ModelCatalog, mode: GeneratorMode): string {
    const entries = entriesFor(catalog, mode).filter((entry) => isModelAllowedFor(mode, entry.model));
    const chosen = entries.find((entry) => entry.default) ?? entries[0];
    return chosen?.model ?? (modeSpec(mode).kind === "image" ? "Nano_Banana_Pro" : "Veo_3.1-Lite");
}

/** Model hiện tại còn dùng được cho chế độ mới không (đổi ảnh ⇄ video, hoặc Omni ⇄ Khung đầu + cuối). */
export function isModelInCatalogFor(catalog: ModelCatalog, mode: GeneratorMode, model: string): boolean {
    return getModelOptions(catalog, mode).some((option) => option.value === model);
}

export function getCreditCost(catalog: ModelCatalog, model: string): number {
    return [...catalog.video, ...catalog.image].find((entry) => entry.model === model)?.credits ?? 0;
}
