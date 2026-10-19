import type { GeneratorSettingsState } from "@/components/generator/types";
import type { CreateTaskItem, CreateTaskUpscale, ImageRef } from "@/types/api";
import { GeneratorError } from "./errors";
import { frameAt } from "./frameJobs";
import type { GeneratorMode } from "./modes";

/** Ảnh đã upload (imageId) + tham số đính kèm, đủ để dựng `images`/`sourceMediaId`. */
export interface ResolvedAttachments {
    start: ImageRef[];
    end: ImageRef[];
    references: ImageRef[];
    sources: ImageRef[];
    voice?: string;
    sourceMediaId?: string;
}

export const EMPTY_RESOLVED: ResolvedAttachments = {
    start: [],
    end: [],
    references: [],
    sources: [],
};

/** API /v1/tasks nhận MỘT ảnh cho images.start / images.end ⇒ job thứ `index` lấy ảnh cùng số thứ tự (1 ảnh ⇒ dùng chung). */
function needImage(images: ImageRef[], index: number, role: string): ImageRef {
    const first = frameAt(images, index);
    if (first === undefined) {
        throw new GeneratorError(
            "ATTACHMENT_MISSING",
            `Thiếu ảnh cho vai trò "${role}".`,
        );
    }
    return first;
}

function need<T>(value: T | undefined, role: string): T {
    if (value === undefined || value === null || value === "") {
        throw new GeneratorError("ATTACHMENT_MISSING", `Thiếu ảnh/video cho vai trò "${role}".`);
    }
    return value;
}

function upscaleOf(settings: GeneratorSettingsState): { upscale?: CreateTaskUpscale } {
    return settings.upscale === "none" ? {} : { upscale: { resolution: settings.upscale } };
}

/** Mỗi prompt ⇒ một task đúng hợp đồng POST /v1/tasks của worker tương ứng (tasks.dto.ts, task-params.schemas.ts). */
export function buildTasks(
    mode: GeneratorMode,
    jobs: string[],
    settings: GeneratorSettingsState,
    ratio: string,
    resolved: ResolvedAttachments,
): CreateTaskItem[] {
    const upscale = upscaleOf(settings);
    const video = { model: settings.model, ratio, duration: settings.duration, audioEnabled: settings.audioEnabled };
    const image = { model: settings.model, ratio };
    return jobs.map((prompt, index): CreateTaskItem => {
        switch (mode) {
            case "text-to-video":
                return { worker: mode, params: { prompt, ...video }, ...upscale };
            case "image-to-video":
                return {
                    worker: mode,
                    params: { prompt, ...video },
                    images: {
                        start: needImage(resolved.start, index, "start"),
                    },
                    ...upscale,
                };

            case "start-end-image-to-video":
                return {
                    worker: mode,
                    params: { prompt, ...video },
                    images: {
                        start: needImage(resolved.start, index, "start"),
                        end: needImage(resolved.end, index, "end"),
                    },
                    ...upscale,
                };
            case "reference-images-to-video":
                return {
                    worker: mode,
                    params: { prompt, ...video, ...(resolved.voice ? { audio: resolved.voice } : {}) },
                    images: { references: resolved.references },
                    ...upscale,
                };
            case "extend-video":
                return {
                    worker: mode,
                    params: { prompt, model: settings.model },
                    sourceMediaId: need(resolved.sourceMediaId, "sourceMediaId"),
                    ...upscale,
                };
            case "text-to-image":
                return {
                    worker: mode,
                    params: { prompt, ...image, ...(settings.seed !== null ? { seed: settings.seed } : {}) },
                    ...upscale,
                };
            case "image-to-image":
                return { worker: mode, params: { prompt, ...image }, images: { sources: resolved.sources }, ...upscale };
        }
    });
}
