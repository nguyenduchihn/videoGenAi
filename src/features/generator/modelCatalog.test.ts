import { describe, expect, it } from "vitest";
import type { ModelCatalog } from "./modelCatalog";
import { getDefaultModel, STATIC_FALLBACK } from "./modelCatalog";
import { LOW_PRIORITY_MODEL } from "./modes";

const catalog: ModelCatalog = {
    video: [
        { model: "Veo_3.1-Lite", family: "veo_3_1_lite", default: true, credits: 5 },
        { model: "Veo_3.1-Omni", family: "abra", default: false, credits: 10 },
        { model: LOW_PRIORITY_MODEL, family: "veo_3_1_lite_low_priority", default: false, credits: 2 },
    ],
    image: [{ model: "Nano_Banana_Pro", family: "image", default: true, credits: 1 }],
};

describe("getDefaultModel", () => {
    it("mọi chế độ video mặc định Lite [Lower Priority], kể cả khi API đánh dấu model khác là default", () => {
        for (const mode of ["text-to-video", "image-to-video", "start-end-image-to-video", "reference-images-to-video"] as const) {
            expect(getDefaultModel(catalog, mode)).toBe(LOW_PRIORITY_MODEL);
        }
    });

    it("trước khi tải catalog (bảng tĩnh) cũng là Lower Priority; ảnh giữ default của API", () => {
        expect(getDefaultModel(STATIC_FALLBACK, "text-to-video")).toBe(LOW_PRIORITY_MODEL);
        expect(getDefaultModel(catalog, "text-to-image")).toBe("Nano_Banana_Pro");
    });

    it("catalog không có Lower Priority ⇒ quay về default của API", () => {
        const noLp = { ...catalog, video: catalog.video.filter((e) => e.model !== LOW_PRIORITY_MODEL) };
        expect(getDefaultModel(noLp, "text-to-video")).toBe("Veo_3.1-Lite");
    });
});
