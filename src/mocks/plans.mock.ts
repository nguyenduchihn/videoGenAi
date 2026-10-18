import type { PricingPlan } from "@/types/api";

/** Gói dịch vụ đang mở bán (chế độ subscription) — dùng cho /portal/pricing.plans và lệnh mua gói. */
export const mockPlansForSale: PricingPlan[] = [
    { id: "starter", name: "Starter", description: "Bắt đầu với 2 luồng, trả credit theo lượt.", priceVnd: 99_000, periodDays: 30, maxConcurrent: 2, maxPending: 200, chargesCredits: true, monthlyCredits: 500, fairUsePerDay: null, allowRealMode: true },
    { id: "pro", name: "Pro", description: "4 luồng song song, 2.000 credit mỗi tháng.", priceVnd: 299_000, periodDays: 30, maxConcurrent: 4, maxPending: 500, chargesCredits: true, monthlyCredits: 2_000, fairUsePerDay: null, allowRealMode: true },
    { id: "unlimited", name: "Unlimited", description: "Không giới hạn lượt tạo, 12 luồng, fair-use 300 video/ngày.", priceVnd: 999_000, periodDays: 30, maxConcurrent: 12, maxPending: 2000, chargesCredits: false, monthlyCredits: 0, fairUsePerDay: 300, allowRealMode: true },
];

interface MockPlanActivation {
    planId: string;
    planExpiresAt: string;
}
let activation: MockPlanActivation | null = null;

/** Lệnh mua gói vừa paid ⇒ /portal/auth/me phản ánh gói + hạn mới (cộng dồn từ hạn hiện tại nếu còn). */
export function activateMockPlan(planId: string, periodDays: number, currentExpiresAt: string | null): MockPlanActivation {
    const now = Date.now();
    const cur = activation?.planExpiresAt ?? currentExpiresAt;
    const base = cur && new Date(cur).getTime() > now ? new Date(cur).getTime() : now;
    activation = { planId, planExpiresAt: new Date(base + periodDays * 86_400_000).toISOString() };
    return activation;
}
export const mockPlanActivation = (): MockPlanActivation | null => activation;
export const resetMockPlanActivation = (): void => {
    activation = null;
};
