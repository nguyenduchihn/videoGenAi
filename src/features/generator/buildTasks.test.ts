import { describe, expect, it } from "vitest";
import type { GeneratorSettingsState } from "@/components/generator/types";
import { buildTasks, EMPTY_RESOLVED } from "./buildTasks";

const settings: GeneratorSettingsState = {
    model: "Veo_3.1-Lite",
    duration: 6,
    audioEnabled: true,
    upscale: "none",
    seed: null,
    customSeparator: "===",
};
const imageSettings: GeneratorSettingsState = { ...settings, model: "Nano_Banana_Pro" };

describe("buildTasks", () => {
    it("text-to-video: one task per prompt with model/ratio/duration/audioEnabled (no generateAudio)", () => {
        const tasks = buildTasks("text-to-video", ["p1", "p2"], settings, "16:9", EMPTY_RESOLVED);
        expect(tasks).toHaveLength(2);
        expect(tasks[0]).toEqual({
            worker: "text-to-video",
            params: { prompt: "p1", model: "Veo_3.1-Lite", ratio: "16:9", duration: 6, audioEnabled: true },
        });
        expect(tasks[1]?.params.prompt).toBe("p2");
        expect("generateAudio" in (tasks[0]?.params ?? {})).toBe(false);
    });

    it("image-to-video: images.start from the resolved start id", () => {
        const [task] = buildTasks("image-to-video", ["p"], settings, "9:16", { ...EMPTY_RESOLVED, start: ["img_s"] });
        expect(task).toEqual({
            worker: "image-to-video",
            params: { prompt: "p", model: "Veo_3.1-Lite", ratio: "9:16", duration: 6, audioEnabled: true },
            images: { start: "img_s" },
        });
    });

    it("start-end-image-to-video: both frames, throws ATTACHMENT_MISSING when end is absent", () => {
        const [task] = buildTasks("start-end-image-to-video", ["p"], settings, "16:9", { ...EMPTY_RESOLVED, start: ["s"], end: ["e"] });
        expect(task).toMatchObject({ worker: "start-end-image-to-video", images: { start: "s", end: "e" } });
        expect(() => buildTasks("start-end-image-to-video", ["p"], settings, "16:9", { ...EMPTY_RESOLVED, start: ["s"] })).toThrow(/end/);
    });

    it("nhiều khung: job thứ i dùng ảnh thứ i; một khung chỉ 1 ảnh ⇒ dùng chung; luôn gửi MỘT ảnh mỗi task", () => {
        const tasks = buildTasks("start-end-image-to-video", ["p1", "p2", "p3"], settings, "16:9", { ...EMPTY_RESOLVED, start: ["s1", "s2", "s3"], end: ["e"] });
        expect(tasks.map((t) => t.images)).toEqual([{ start: "s1", end: "e" }, { start: "s2", end: "e" }, { start: "s3", end: "e" }]);
        const one = buildTasks("image-to-video", ["a", "b"], settings, "16:9", { ...EMPTY_RESOLVED, start: ["only"] });
        expect(one.map((t) => t.images)).toEqual([{ start: "only" }, { start: "only" }]);
    });

    it("reference-images-to-video: references with handles, voice only when given", () => {
        const refs = ["a", { imageId: "b", handle: "girl" }];
        const [withVoice] = buildTasks("reference-images-to-video", ["p"], settings, "16:9", { ...EMPTY_RESOLVED, references: refs, voice: "giọng nữ" });
        expect(withVoice).toEqual({
            worker: "reference-images-to-video",
            params: { prompt: "p", model: "Veo_3.1-Lite", ratio: "16:9", duration: 6, audioEnabled: true, audio: "giọng nữ" },
            images: { references: refs },
        });
        const [noVoice] = buildTasks("reference-images-to-video", ["p"], settings, "16:9", { ...EMPTY_RESOLVED, references: refs });
        expect("audio" in (noVoice?.params ?? {})).toBe(false);
    });

    it("text-to-image: ratio + optional seed, never duration/audio", () => {
        const [plain] = buildTasks("text-to-image", ["p"], imageSettings, "1:1", EMPTY_RESOLVED);
        expect(plain).toEqual({ worker: "text-to-image", params: { prompt: "p", model: "Nano_Banana_Pro", ratio: "1:1" } });
        const [seeded] = buildTasks("text-to-image", ["p"], { ...imageSettings, seed: 12345 }, "4:3", EMPTY_RESOLVED);
        expect(seeded?.params).toEqual({ prompt: "p", model: "Nano_Banana_Pro", ratio: "4:3", seed: 12345 });
    });

    it("image-to-image: always sends images.sources (even for one image) and no seed", () => {
        const [task] = buildTasks("image-to-image", ["p"], { ...imageSettings, seed: 12345 }, "1:1", { ...EMPTY_RESOLVED, sources: [{ imageId: "x", handle: "a" }] });
        expect(task).toEqual({
            worker: "image-to-image",
            params: { prompt: "p", model: "Nano_Banana_Pro", ratio: "1:1" },
            images: { sources: [{ imageId: "x", handle: "a" }] },
        });
    });

    it("upscale: attached per task when chosen, resolution as given", () => {
        const [video] = buildTasks("text-to-video", ["p"], { ...settings, upscale: "1080P" }, "16:9", EMPTY_RESOLVED);
        expect(video?.upscale).toEqual({ resolution: "1080P" });
        const [image] = buildTasks("text-to-image", ["p"], { ...imageSettings, upscale: "4K" }, "1:1", EMPTY_RESOLVED);
        expect(image?.upscale).toEqual({ resolution: "4K" });
        const [none] = buildTasks("text-to-image", ["p"], imageSettings, "1:1", EMPTY_RESOLVED);
        expect("upscale" in (none ?? {})).toBe(false);
    });
});
