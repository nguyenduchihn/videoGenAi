import type { PaymentPackage, PricingWorker } from "@/types/api";
import { cheapestCredits } from "./workerInfo";

export interface EstimateInput {
    workers: Record<string, PricingWorker>;
    worker: string;
    /** Số lượt tạo mỗi tháng (làm tròn xuống, âm coi như 0). */
    perMonth: number;
    packages: PaymentPackage[];
}

export interface EstimateResult {
    creditsPerTask: number | null;
    creditsPerMonth: number | null;
    /** Gói nhỏ nhất đủ credit cho một tháng; không gói nào đủ ⇒ gói lớn nhất; không có giá ⇒ null. */
    recommended: PaymentPackage | null;
}

/** Ước tính credit/tháng và gói nạp phù hợp từ bảng giá công khai — hàm thuần, không phụ thuộc React. */
export function estimateCredits({ workers, worker, perMonth, packages }: EstimateInput): EstimateResult {
    const creditsPerTask = cheapestCredits(workers[worker]);
    const count = Number.isFinite(perMonth) ? Math.max(0, Math.floor(perMonth)) : 0;
    if (creditsPerTask === null) return { creditsPerTask: null, creditsPerMonth: null, recommended: null };
    const creditsPerMonth = creditsPerTask * count;
    const sorted = [...packages].sort((a, b) => a.credits - b.credits);
    const recommended = sorted.find((p) => p.credits >= creditsPerMonth) ?? sorted.at(-1) ?? null;
    return { creditsPerTask, creditsPerMonth, recommended };
}

/** Đơn giá đồng/credit của gói, 1 chữ số thập phân; gói 0 credit ⇒ null. */
export function vndPerCredit(pkg: Pick<PaymentPackage, "amountVnd" | "credits">): number | null {
    if (pkg.credits <= 0) return null;
    return Math.round((pkg.amountVnd / pkg.credits) * 10) / 10;
}
