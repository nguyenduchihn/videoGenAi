import { cheapestCredits, getWorkerInfo, orderWorkers } from "@/features/pricing/workerInfo";
import type { PricingWorker } from "@/types/api";

interface CreditCostTableProps {
    workers: Record<string, PricingWorker>;
    /** Đơn giá đồng/credit của gói nổi bật ⇒ cột "≈ ₫"; null (chế độ gói) ⇒ ẩn cột. */
    vndPerCreditValue: number | null;
}

const fmt = new Intl.NumberFormat("vi-VN");

/** Chi phí credit mỗi lượt theo worker, lấy từ bảng giá công khai; worker chưa có giá bị ẩn. */
export function CreditCostTable({ workers, vndPerCreditValue }: CreditCostTableProps) {
    const rows = orderWorkers(Object.keys(workers))
        .map((key) => {
            const w = workers[key];
            const credits = cheapestCredits(w);
            // "từ" chỉ khi có model rẻ hơn giá mặc định (vd Veo Lite 5 so với mặc định 10)
            const cheaperModel = credits !== null && typeof w?.credits === "number" && credits < w.credits;
            return { key, info: getWorkerInfo(key), credits, cheaperModel };
        })
        .filter((r): r is typeof r & { credits: number } => r.credits !== null);
    if (rows.length === 0) return <p className="text-sm text-app-text-muted">Bảng giá đang được cập nhật.</p>;
    return (
        <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-bg">
            <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Chi phí credit mỗi lượt tạo theo chế độ</caption>
                <thead>
                    <tr className="border-b border-app-border text-[11px] uppercase tracking-wider text-app-text-muted">
                        <th scope="col" className="px-4 py-3 font-semibold">Chế độ</th>
                        <th scope="col" className="num px-4 py-3 text-right font-semibold">Credit / lượt</th>
                        {vndPerCreditValue !== null && <th scope="col" className="num px-4 py-3 text-right font-semibold">≈ Tiền</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.key} className="border-b border-app-border/70 last:border-0">
                            <th scope="row" className="px-4 py-3 font-medium text-app-text">
                                {r.info.label}
                                {r.cheaperModel && <span className="ml-2 text-[11px] font-normal text-app-text-muted">từ</span>}
                            </th>
                            <td className="num px-4 py-3 text-right text-app-text">{fmt.format(r.credits)}</td>
                            {vndPerCreditValue !== null && <td className="num px-4 py-3 text-right text-app-text-secondary">{fmt.format(Math.round(r.credits * vndPerCreditValue))} ₫</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
