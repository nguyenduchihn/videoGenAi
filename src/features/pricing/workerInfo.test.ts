import { describe, expect, it } from "vitest";
import { cheapestCredits, getWorkerInfo, orderWorkers, WORKER_INFO, WORKER_ORDER } from "./workerInfo";

describe("workerInfo — nhãn worker thật dùng chung landing + trang giá", () => {
    it("mọi worker trong WORKER_ORDER đều có nhãn và mô tả", () => {
        for (const key of WORKER_ORDER) {
            expect(WORKER_INFO[key]?.label.length).toBeGreaterThan(0);
            expect(WORKER_INFO[key]?.description.length).toBeGreaterThan(0);
        }
    });

    it("worker lạ ⇒ nhãn là chính key, mô tả mặc định", () => {
        expect(getWorkerInfo("brand-new-worker")).toMatchObject({ label: "brand-new-worker" });
    });

    it("orderWorkers xếp theo WORKER_ORDER, worker lạ cuối theo tên", () => {
        expect(orderWorkers(["zeta", "text-to-image", "alpha", "text-to-video"])).toEqual(["text-to-video", "text-to-image", "alpha", "zeta"]);
    });

    it("cheapestCredits: min của giá mặc định và giá model; không giá ⇒ null", () => {
        expect(cheapestCredits({ credits: 10, models: { "Veo_3.1-Lite": 5, "Veo_3.1-Lite [Lower Priority]": 2 } })).toBe(2);
        expect(cheapestCredits({ credits: null, models: { "2K": 2, "4K": 4 } })).toBe(2);
        expect(cheapestCredits({ credits: null, models: {} })).toBeNull();
        expect(cheapestCredits(undefined)).toBeNull();
    });
});
