import { describe, expect, it } from "vitest";
import { expiryText, nextExpiryAfterPurchase, periodLabel, planExpiry, planFeatures, planStatus, priceLabel } from "./planCopy";

const now = new Date("2026-10-16T00:00:00Z");

describe("planCopy", () => {
    it("planExpiry phân loại không hạn / còn N ngày / sắp hết (≤ 7) / đã hết và expiryText đọc được", () => {
        expect(planExpiry(null, now)).toEqual({ state: "none" });
        expect(planExpiry("2026-11-15T00:00:00Z", now)).toMatchObject({ state: "active", daysLeft: 30 });
        expect(planExpiry("2026-10-19T00:00:00Z", now)).toMatchObject({ state: "soon", daysLeft: 3 });
        expect(planExpiry("2026-10-14T00:00:00Z", now)).toMatchObject({ state: "expired", daysLeft: -2 });
        expect(expiryText(planExpiry("2026-10-19T00:00:00Z", now))).toBe("Còn 3 ngày");
        expect(expiryText(planExpiry("2026-10-14T00:00:00Z", now))).toBe("Hết hạn 2 ngày trước");
        expect(expiryText({ state: "none" })).toBe("Không thời hạn");
    });

    it("nhãn giá/kỳ hạn và tính năng suy từ giới hạn gói", () => {
        expect(periodLabel(30)).toBe("tháng");
        expect(periodLabel(365)).toBe("năm");
        expect(periodLabel(7)).toBe("7 ngày");
        expect(priceLabel({ priceVnd: 299_000, periodDays: 30 })).toMatch(/299\.000.*tháng$/);
        expect(planFeatures({ maxConcurrent: 12, maxPending: 2000, chargesCredits: false, monthlyCredits: 0, fairUsePerDay: 300 })).toEqual([
            "12 job chạy đồng thời",
            "2.000 job trong hàng đợi",
            "Không trừ credit · tối đa 300 video/ngày",
        ]);
        expect(planFeatures({ maxConcurrent: 4, maxPending: 500, chargesCredits: true, monthlyCredits: 2000, fairUsePerDay: null })[2]).toBe("2.000 credit mỗi kỳ, trừ theo lượt tạo");
        expect(planFeatures({ maxConcurrent: 2, maxPending: 200, chargesCredits: true, monthlyCredits: 0, fairUsePerDay: null })[2]).toBe("Trừ credit theo lượt tạo (bảng giá AI)");
    });

    it("gia hạn cộng dồn từ hạn còn lại, mua khi hết hạn tính từ bây giờ; trạng thái gói trên header", () => {
        expect(nextExpiryAfterPurchase("2026-11-15T00:00:00Z", 30, now).toISOString()).toBe("2026-12-15T00:00:00.000Z");
        expect(nextExpiryAfterPurchase("2026-10-01T00:00:00Z", 30, now).toISOString()).toBe("2026-11-15T00:00:00.000Z");
        expect(nextExpiryAfterPurchase(null, 7, now).toISOString()).toBe("2026-10-23T00:00:00.000Z");
        const base = { plan: { chargesCredits: true } as never, user: { planExpiresAt: null } as never };
        expect(planStatus(base)).toEqual({ label: "Đang hoạt động", tone: "success" });
        expect(planStatus({ plan: null, user: base.user })).toEqual({ label: "Chưa có gói", tone: "default" });
        expect(planStatus({ plan: base.plan, user: { planExpiresAt: "2020-01-01T00:00:00Z" } as never })).toEqual({ label: "Hết hạn", tone: "danger" });
    });
});
