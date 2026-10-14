import { describe, it, expect } from "vitest";
import { buildTasks } from "./buildTasks";
import type { GeneratorSettingsState } from "@/components/generator/types";

const settings: GeneratorSettingsState = {
    model: "Veo_3.1-Lite",
    parallel: 8,
    batchDelay: 10,
    burstSize: 1,
    generateAudio: true,
    upscaleThreads: 1,
    customSeparator: "===",
};

describe("buildTasks", () => {
    it("text-to-video 2 prompts → 2 items with params.model/aspectRatio/audio", () => {
        const tasks = buildTasks("text-to-video", ["p1", "p2"], settings, "16:9", {});
        expect(tasks).toHaveLength(2);
        expect(tasks[0]).toEqual({
            worker: "text-to-video",
            params: { prompt: "p1", model: "Veo_3.1-Lite", ratio: "16:9", generateAudio: true },
        });
        expect(tasks[1]).toMatchObject({ params: { prompt: "p2", model: "Veo_3.1-Lite" } });
    });

    it("image-to-video with start only → worker image-to-video, images.start set", () => {
        const tasks = buildTasks("image-to-video", ["p1"], settings, "16:9", { startImageId: "sid" });
        expect(tasks[0]).toMatchObject({
            worker: "image-to-video",
            params: { prompt: "p1", generateAudio: true },
            images: { start: "sid" },
        });
        expect((tasks[0].images as Record<string, unknown>).end).toBeUndefined();
    });

    it("image-to-video with start+end → worker start-end-image-to-video", () => {
        const tasks = buildTasks("image-to-video", ["p1"], settings, "16:9", {
            startImageId: "sid",
            endImageId: "eid",
        });
        expect(tasks[0]).toMatchObject({
            worker: "start-end-image-to-video",
            images: { start: "sid", end: "eid" },
        });
    });

    it("image-to-video without startImageId throws START_FRAME_REQUIRED", () => {
        expect(() => buildTasks("image-to-video", ["p1"], settings, "16:9", {})).toThrow("START_FRAME_REQUIRED");
    });

    it("unsupported mode throws with backend message", () => {
        expect(() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            buildTasks("components" as any, ["p1"], settings, "16:9", {}),
        ).toThrow("chưa được nối API backend");
    });
});
