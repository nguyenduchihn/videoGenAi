import { describe, expect, it } from "vitest";
import { EMPTY_ATTACHMENTS, type AttachedImage, type GeneratorAttachments, type GeneratorSettingsState } from "@/components/generator/types";
import { validateGenerator } from "./validation";

const settings: GeneratorSettingsState = {
    model: "Veo_3.1-Lite",
    duration: 8,
    audioEnabled: true,
    upscale: "none",
    seed: null,
    customSeparator: "===",
};

let counter = 0;
const image = (handle = ""): AttachedImage => ({
    localId: `img-${counter++}`,
    file: new File(["x"], `f${counter}.png`, { type: "image/png" }),
    previewUrl: "blob:x",
    handle,
});
const attachments = (patch: Partial<GeneratorAttachments>): GeneratorAttachments => ({ ...EMPTY_ATTACHMENTS, ...patch });

describe("validateGenerator — nhiều ảnh khung", () => {
    it("khung đầu và cuối đều nhiều ảnh nhưng lệch số lượng ⇒ lỗi ở Khung cuối", () => {
        const r = validateGenerator({ mode: "start-end-image-to-video", jobs: ["p"], settings, attachments: attachments({ start: [image(), image()], end: [image(), image(), image()] }) });
        expect(r).toMatchObject({ valid: false, field: "end" });
    });

    it("số prompt khác 1 và khác số ảnh ⇒ lỗi prompt nêu đúng số ảnh", () => {
        const r = validateGenerator({
            mode: "image-to-video", jobs: ["a", "b"], settings, attachments: attachments({ start: [image(), image(), image()] }),
            framePlan: { frames: 3, jobs: ["a", "b"], promptMismatch: true },
        });
        expect(r).toMatchObject({ valid: false, field: "prompt" });
        expect(r.message).toContain("3 ảnh");
    });

    it("3 khung đầu + 1 khung cuối dùng chung ⇒ hợp lệ", () => {
        const r = validateGenerator({ mode: "start-end-image-to-video", jobs: ["p", "p", "p"], settings, attachments: attachments({ start: [image(), image(), image()], end: [image()] }) });
        expect(r.valid).toBe(true);
    });
});

describe("validateGenerator", () => {
    it("rejects empty prompt list first", () => {
        const result = validateGenerator({ mode: "text-to-video", jobs: [], settings, attachments: EMPTY_ATTACHMENTS });
        expect(result).toEqual({ valid: false, message: "Vui lòng nhập prompt.", field: "prompt" });
    });

    it("rejects a prompt longer than 4000 characters and names its index", () => {
        const jobs = ["ok", "x".repeat(4001)];
        const result = validateGenerator({ mode: "text-to-video", jobs, settings, attachments: EMPTY_ATTACHMENTS });
        expect(result.message).toBe("Prompt #2 dài quá 4000 ký tự.");
    });

    it("text-to-video with a prompt is valid", () => {
        expect(validateGenerator({ mode: "text-to-video", jobs: ["p"], settings, attachments: EMPTY_ATTACHMENTS })).toEqual({ valid: true });
    });

    it("image-to-video requires a start frame", () => {
        const result = validateGenerator({ mode: "image-to-video", jobs: ["p"], settings, attachments: EMPTY_ATTACHMENTS });
        expect(result).toMatchObject({ valid: false, field: "start", message: "Vui lòng chọn ảnh Khung đầu." });
    });

    it("start-end requires both frames", () => {
        const result = validateGenerator({
            mode: "start-end-image-to-video",
            jobs: ["p"],
            settings,
            attachments: attachments({ start: [image()] }),
        });
        expect(result).toMatchObject({ field: "end", message: "Vui lòng chọn ảnh Khung cuối." });
    });

    it("start-end rejects Omni after the frames are present", () => {
        const result = validateGenerator({
            mode: "start-end-image-to-video",
            jobs: ["p"],
            settings: { ...settings, model: "Veo_3.1-Omni" },
            attachments: attachments({ start: [image()], end: [image()] }),
        });
        expect(result).toMatchObject({ field: "model" });
        expect(result.message).toContain("Omni không hỗ trợ");
    });

    it("reference mode needs 1 image and caps at 3 for non-Omni, suggesting Omni", () => {
        const none = validateGenerator({ mode: "reference-images-to-video", jobs: ["p"], settings, attachments: EMPTY_ATTACHMENTS });
        expect(none.message).toBe("Vui lòng chọn ít nhất 1 ảnh tham chiếu.");

        const four = validateGenerator({
            mode: "reference-images-to-video",
            jobs: ["p"],
            settings,
            attachments: attachments({ references: [image(), image(), image(), image()] }),
        });
        expect(four.field).toBe("references");
        expect(four.message).toBe("Model Veo 3.1 Lite chỉ nhận tối đa 3 ảnh tham chiếu (đang chọn 4). Chọn Veo 3.1 Omni để dùng tới 7 ảnh.");
    });

    it("reference mode with Omni accepts 7 and rejects 8 without the Omni hint", () => {
        const omni = { ...settings, model: "Veo_3.1-Omni" };
        const seven = Array.from({ length: 7 }, () => image());
        expect(validateGenerator({ mode: "reference-images-to-video", jobs: ["p"], settings: omni, attachments: attachments({ references: seven }) }).valid).toBe(true);
        const eight = validateGenerator({ mode: "reference-images-to-video", jobs: ["p"], settings: omni, attachments: attachments({ references: [...seven, image()] }) });
        expect(eight.message).toBe("Model Veo 3.1 Omni chỉ nhận tối đa 7 ảnh tham chiếu (đang chọn 8).");
    });

    it("image-to-image needs 1–10 sources", () => {
        const none = validateGenerator({ mode: "image-to-image", jobs: ["p"], settings, attachments: EMPTY_ATTACHMENTS });
        expect(none.message).toBe("Vui lòng chọn ít nhất 1 ảnh nguồn.");
        const eleven = Array.from({ length: 11 }, () => image());
        const tooMany = validateGenerator({ mode: "image-to-image", jobs: ["p"], settings, attachments: attachments({ sources: eleven }) });
        expect(tooMany.message).toBe("Tối đa 10 ảnh nguồn (đang chọn 11).");
    });

    it("rejects malformed and duplicate handles", () => {
        const bad = validateGenerator({ mode: "image-to-image", jobs: ["p"], settings, attachments: attachments({ sources: [image("Cô gái")] }) });
        expect(bad.field).toBe("handle");
        expect(bad.message).toContain("@Cô gái không hợp lệ");
        const dup = validateGenerator({ mode: "image-to-image", jobs: ["p"], settings, attachments: attachments({ sources: [image("a"), image("a")] }) });
        expect(dup.message).toBe("Tên ảnh @a bị trùng.");
    });

    it("every @mention in a prompt must be bound to an image handle (also in text-only modes)", () => {
        const bound = validateGenerator({ mode: "image-to-image", jobs: ["ảnh @girl ở quán"], settings, attachments: attachments({ sources: [image("girl")] }) });
        expect(bound.valid).toBe(true);
        const unbound = validateGenerator({ mode: "image-to-image", jobs: ["ok", "ảnh @boy ở quán"], settings, attachments: attachments({ sources: [image("girl")] }) });
        expect(unbound.message).toBe("Prompt #2 nhắc @boy nhưng chưa có ảnh nào đặt tên @boy.");
        const textOnly = validateGenerator({ mode: "text-to-video", jobs: ["xin chào @ai"], settings, attachments: EMPTY_ATTACHMENTS });
        expect(textOnly.valid).toBe(false);
        const email = validateGenerator({ mode: "text-to-video", jobs: ["liên hệ a@b.com"], settings, attachments: EMPTY_ATTACHMENTS });
        expect(email.valid).toBe(true);
    });

    it("voice is capped at 200 characters and seed must be within 10000–99999 for text-to-image", () => {
        const voice = validateGenerator({
            mode: "reference-images-to-video",
            jobs: ["p"],
            settings,
            attachments: attachments({ references: [image()], voice: "v".repeat(201) }),
        });
        expect(voice.message).toBe("Giọng nói tối đa 200 ký tự.");
        const seed = validateGenerator({ mode: "text-to-image", jobs: ["p"], settings: { ...settings, seed: 5 }, attachments: EMPTY_ATTACHMENTS });
        expect(seed.message).toBe("Seed phải từ 10000 đến 99999.");
        const seedIgnoredForVideo = validateGenerator({ mode: "text-to-video", jobs: ["p"], settings: { ...settings, seed: 5 }, attachments: EMPTY_ATTACHMENTS });
        expect(seedIgnoredForVideo.valid).toBe(true);
    });
});
