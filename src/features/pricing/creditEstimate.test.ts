import { describe, expect, it } from "vitest";
import { estimateCredits, vndPerCredit } from "./creditEstimate";

const workers = {
    "text-to-video": { credits: 10, models: { "Veo_3.1-Lite": 5 } },
    "text-to-image": { credits: 1, models: {} },
    "upscale-image": { credits: null, models: { "2K": 2, "4K": 4 } },
    "no-price": { credits: null, models: {} },
};
const packages = [
    { id: "starter", label: "Starter", amountVnd: 50_000, credits: 1_200 },
    { id: "plus", label: "Plus", amountVnd: 100_000, credits: 2_500 },
    { id: "pro", label: "Pro", amountVnd: 250_000, credits: 6_500 },
];

describe("estimateCredits — ước tính credit/tháng và gói phù hợp", () => {
    it("tính theo giá rẻ nhất của worker và gợi ý gói nhỏ nhất đủ credit", () => {
        const r = estimateCredits({ workers, worker: "text-to-video", perMonth: 100, packages });
        expect(r).toMatchObject({ creditsPerTask: 5, creditsPerMonth: 500 });
        expect(r.recommended?.id).toBe("starter");
    });

    it("vượt mọi gói ⇒ gợi ý gói lớn nhất; số lượt lẻ/âm được làm tròn xuống về 0", () => {
        expect(estimateCredits({ workers, worker: "text-to-video", perMonth: 10_000, packages }).recommended?.id).toBe("pro");
        expect(estimateCredits({ workers, worker: "text-to-image", perMonth: 7.9, packages }).creditsPerMonth).toBe(7);
        expect(estimateCredits({ workers, worker: "text-to-image", perMonth: -3, packages }).creditsPerMonth).toBe(0);
    });

    it("worker chỉ có giá theo model ⇒ dùng model rẻ nhất; chưa có giá ⇒ null toàn bộ", () => {
        expect(estimateCredits({ workers, worker: "upscale-image", perMonth: 10, packages }).creditsPerMonth).toBe(20);
        expect(estimateCredits({ workers, worker: "no-price", perMonth: 10, packages })).toEqual({ creditsPerTask: null, creditsPerMonth: null, recommended: null });
    });

    it("không có gói nào (chế độ subscription) ⇒ recommended null nhưng vẫn có số credit", () => {
        const r = estimateCredits({ workers, worker: "text-to-image", perMonth: 30, packages: [] });
        expect(r).toEqual({ creditsPerTask: 1, creditsPerMonth: 30, recommended: null });
    });

    it("vndPerCredit làm tròn 1 chữ số; gói 0 credit ⇒ null", () => {
        expect(vndPerCredit({ amountVnd: 50_000, credits: 1_200 })).toBe(41.7);
        expect(vndPerCredit({ amountVnd: 250_000, credits: 6_500 })).toBe(38.5);
        expect(vndPerCredit({ amountVnd: 1, credits: 0 })).toBeNull();
    });
});
