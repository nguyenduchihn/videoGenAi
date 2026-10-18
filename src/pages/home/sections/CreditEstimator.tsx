import { Calculator } from "lucide-react";
import { useId, useState } from "react";
import { estimateCredits } from "@/features/pricing/creditEstimate";
import { cheapestCredits, getWorkerInfo, orderWorkers } from "@/features/pricing/workerInfo";
import { formatVnd } from "@/lib/format";
import type { PaymentPackage, PricingWorker } from "@/types/api";

interface CreditEstimatorProps {
    workers: Record<string, PricingWorker>;
    packages: PaymentPackage[];
}

const fmt = new Intl.NumberFormat("vi-VN");

/** Ước tính nhanh: chọn chế độ + số lượt mỗi tháng ⇒ credit cần và gói nạp vừa đủ (hàm thuần estimateCredits). */
export function CreditEstimator({ workers, packages }: CreditEstimatorProps) {
    const priced = orderWorkers(Object.keys(workers)).filter((k) => cheapestCredits(workers[k]) !== null);
    const [worker, setWorker] = useState(() => priced.includes("text-to-video") ? "text-to-video" : (priced[0] ?? ""));
    const [perMonth, setPerMonth] = useState(30);
    const selectId = useId();
    const countId = useId();
    if (priced.length === 0) return null;
    const result = estimateCredits({ workers, worker, perMonth, packages });

    return (
        <div className="rounded-2xl border border-app-border bg-app-bg p-5 sm:p-6">
            <div className="flex items-center gap-2 text-app-text">
                <Calculator className="h-4 w-4 text-app-accent" aria-hidden />
                <h3 className="text-sm font-semibold">Ước tính chi phí</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label htmlFor={selectId} className="text-xs font-medium text-app-text-secondary">
                    Chế độ
                    <select
                        id={selectId}
                        value={worker}
                        onChange={(e) => setWorker(e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40"
                    >
                        {priced.map((k) => <option key={k} value={k}>{getWorkerInfo(k).label}</option>)}
                    </select>
                </label>
                <label htmlFor={countId} className="text-xs font-medium text-app-text-secondary">
                    Số lượt mỗi tháng
                    <input
                        id={countId}
                        type="number"
                        min={0}
                        max={100_000}
                        inputMode="numeric"
                        value={perMonth}
                        onChange={(e) => setPerMonth(Number(e.target.value))}
                        className="num mt-1.5 block w-full rounded-lg border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40"
                    />
                </label>
            </div>
            <p className="mt-4 text-sm leading-6 text-app-text-secondary" aria-live="polite">
                {result.creditsPerMonth === null ? (
                    "Chế độ này chưa có giá."
                ) : (
                    <>
                        Cần khoảng <strong className="num text-app-text">{fmt.format(result.creditsPerMonth)} credit</strong> mỗi tháng
                        {result.recommended && (
                            <> — gói <strong className="text-app-text">{result.recommended.label}</strong> ({formatVnd(result.recommended.amountVnd)}, {fmt.format(result.recommended.credits)} credit) là đủ.</>
                        )}
                        {!result.recommended && "."}
                    </>
                )}
            </p>
        </div>
    );
}
