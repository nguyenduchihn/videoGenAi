import type { GeneratorMode, GeneratorSettingsState } from "@/components/generator/types";
import type { CreateTaskItem } from "@/types/api";

export interface UploadedIds {
    startImageId?: string;
    endImageId?: string;
}

export function buildTasks(
    mode: GeneratorMode,
    jobs: string[],
    settings: GeneratorSettingsState,
    aspectRatio: string,
    { startImageId, endImageId }: UploadedIds,
): CreateTaskItem[] {
    return jobs.map((job) => {
        if (mode === "image-to-video") {
            if (!startImageId) throw new Error("START_FRAME_REQUIRED");
            if (endImageId) {
                return {
                    worker: "start-end-image-to-video" as const,
                    params: { prompt: job, model: settings.model, ratio: aspectRatio, generateAudio: settings.generateAudio },
                    images: { start: startImageId, end: endImageId },
                };
            }
            return {
                worker: "image-to-video" as const,
                params: { prompt: job, model: settings.model, ratio: aspectRatio, generateAudio: settings.generateAudio },
                images: { start: startImageId },
            };
        }
        if (mode === "text-to-video") {
            return {
                worker: "text-to-video" as const,
                params: { prompt: job, model: settings.model, ratio: aspectRatio, generateAudio: settings.generateAudio },
            };
        }
        if (mode === "text-to-image") {
            return {
                worker: "text-to-image" as const,
                params: { prompt: job, model: settings.model, ratio: aspectRatio },
            };
        }
        throw new Error(`Mode "${mode}" chưa được nối API backend.`);
    });
}
