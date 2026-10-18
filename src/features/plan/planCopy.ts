import type { PortalMeResponse, PortalPlan, PricingPlan } from "@/types/api";

export const DAY_MS = 86_400_000;
export const EXPIRY_SOON_DAYS = 7;

export type PlanExpiry = { state: "none" } | { state: "active" | "soon" | "expired"; daysLeft: number; at: string };

/** Trạng thái hạn gói: none (không hạn) · active · soon (≤ 7 ngày) · expired; daysLeft làm tròn lên. */
export function planExpiry(planExpiresAt: string | null | undefined, now: Date = new Date()): PlanExpiry {
    if (!planExpiresAt) return { state: "none" };
    const daysLeft = Math.ceil((new Date(planExpiresAt).getTime() - now.getTime()) / DAY_MS);
    if (daysLeft < 0) return { state: "expired", daysLeft, at: planExpiresAt };
    return { state: daysLeft <= EXPIRY_SOON_DAYS ? "soon" : "active", daysLeft, at: planExpiresAt };
}

export function expiryText(e: PlanExpiry): string {
    switch (e.state) {
        case "none": return "Không thời hạn";
        case "expired": return e.daysLeft === 0 ? "Hết hạn hôm nay" : `Hết hạn ${(-e.daysLeft).toLocaleString("vi-VN")} ngày trước`;
        default: return `Còn ${e.daysLeft.toLocaleString("vi-VN")} ngày`;
    }
}

/** "tháng" · "năm" · "N ngày" cho nhãn giá. */
export function periodLabel(days: number): string {
    if (days === 30) return "tháng";
    if (days === 365) return "năm";
    return `${days.toLocaleString("vi-VN")} ngày`;
}

export const priceLabel = (plan: Pick<PricingPlan, "priceVnd" | "periodDays">): string =>
    `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(plan.priceVnd)} / ${periodLabel(plan.periodDays)}`;

/** Dòng tính năng suy từ giới hạn gói (không cần admin nhập tay). */
export function planFeatures(plan: Pick<PricingPlan, "maxConcurrent" | "maxPending" | "chargesCredits" | "monthlyCredits" | "fairUsePerDay">): string[] {
    const out = [`${plan.maxConcurrent.toLocaleString("vi-VN")} job chạy đồng thời`, `${plan.maxPending.toLocaleString("vi-VN")} job trong hàng đợi`];
    if (!plan.chargesCredits) out.push(plan.fairUsePerDay ? `Không trừ credit · tối đa ${plan.fairUsePerDay.toLocaleString("vi-VN")} video/ngày` : "Không trừ credit, không giới hạn lượt tạo");
    else if (plan.monthlyCredits > 0) out.push(`${plan.monthlyCredits.toLocaleString("vi-VN")} credit mỗi kỳ, trừ theo lượt tạo`);
    else out.push("Trừ credit theo lượt tạo (bảng giá AI)");
    return out;
}

/** Gói không trừ credit ⇒ số dư không có ý nghĩa với khách (ẩn khỏi thẻ/sidebar). */
export const planChargesCredits = (plan: Pick<PortalPlan, "chargesCredits"> | null | undefined): boolean => plan?.chargesCredits ?? true;

/** Hạn mới nếu mua/gia hạn ngay: cộng dồn từ hạn còn lại, không thì từ bây giờ. */
export function nextExpiryAfterPurchase(current: string | null | undefined, periodDays: number, now: Date = new Date()): Date {
    const cur = current ? new Date(current).getTime() : 0;
    return new Date((cur > now.getTime() ? cur : now.getTime()) + periodDays * DAY_MS);
}

/** Nhãn trạng thái gói trên header /my-plan. */
export function planStatus(me: Pick<PortalMeResponse, "plan" | "user">): { label: string; tone: "success" | "warning" | "danger" | "default" } {
    if (!me.plan) return { label: "Chưa có gói", tone: "default" };
    const e = planExpiry(me.user.planExpiresAt);
    if (e.state === "expired") return { label: "Hết hạn", tone: "danger" };
    if (e.state === "soon") return { label: `Đang hoạt động · còn ${e.daysLeft} ngày`, tone: "warning" };
    if (e.state === "active") return { label: `Đang hoạt động · còn ${e.daysLeft.toLocaleString("vi-VN")} ngày`, tone: "success" };
    return { label: "Đang hoạt động", tone: "success" };
}
