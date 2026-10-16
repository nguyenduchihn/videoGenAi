import { describe, expect, it } from "vitest";
import { creditBadge, trialCtaLabel } from "../landingCopy";
import { buildFaq } from "./faq";

describe("copy landing lấy số liệu từ API", () => {
    it("trialCtaLabel: có số credit ⇒ ghi số, chưa có ⇒ câu chung", () => {
        expect(trialCtaLabel(100)).toBe("Dùng thử · 100 credit miễn phí");
        expect(trialCtaLabel(1200)).toBe("Dùng thử · 1.200 credit miễn phí");
        expect(trialCtaLabel(0)).toBe("Dùng thử miễn phí");
        expect(trialCtaLabel(undefined)).toBe("Dùng thử miễn phí");
    });

    it("creditBadge: 'từ N' khi model rẻ hơn mặc định, 'N' khi chỉ một giá, null khi chưa có giá", () => {
        expect(creditBadge({ credits: 10, models: { "Veo_3.1-Lite": 5 } })).toBe("từ 5 credit");
        expect(creditBadge({ credits: 1, models: {} })).toBe("1 credit");
        expect(creditBadge({ credits: null, models: { "2K": 2, "4K": 4 } })).toBe("2 credit");
        expect(creditBadge({ credits: null, models: {} })).toBeNull();
        expect(creditBadge(undefined)).toBeNull();
    });

    it("buildFaq: đổi câu theo chế độ bán và chèn số lô/số credit", () => {
        const payg = buildFaq({ signupGrant: 100, maxBatchTasks: 20, subscription: false });
        expect(payg).toHaveLength(8);
        expect(payg[0]!.a).toContain("100 credit");
        expect(payg[1]!.q).toBe("Credit có hết hạn không?");
        expect(payg[5]!.a).toContain("tới 20 task");
        const sub = buildFaq({ subscription: true });
        expect(sub[1]!.q).toBe("Gói dịch vụ hoạt động thế nào?");
        expect(sub[0]!.a).not.toContain("undefined");
    });
});
