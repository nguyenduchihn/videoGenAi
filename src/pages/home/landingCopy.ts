import type { PricingWorker } from "@/types/api";
import { cheapestCredits } from "@/features/pricing/workerInfo";

/** Trang tài liệu tích hợp (cùng site); tham chiếu OpenAPI đầy đủ ở /docs. */
export const API_DOCS_URL = "/api-docs";

/** Nhãn CTA đăng ký: có số credit tặng khi API đã trả, không thì câu chung (không hard-code số). */
export function trialCtaLabel(signupGrant: number | undefined): string {
    return signupGrant && signupGrant > 0 ? `Dùng thử · ${signupGrant.toLocaleString("vi-VN")} credit miễn phí` : "Dùng thử miễn phí";
}

/** Nhãn credit từ bảng giá API: "N credit" hoặc "từ N credit" khi có model rẻ hơn mặc định; null ⇒ ẩn (admin chưa đặt giá). */
export function creditBadge(worker: PricingWorker | undefined): string | null {
    const min = cheapestCredits(worker);
    if (min === null) return null;
    const prefix = worker?.credits !== null && worker?.credits !== undefined && min < worker.credits ? "từ " : "";
    return `${prefix}${min.toLocaleString("vi-VN")} credit`;
}
