import { Coins, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";
import { vndPerCredit } from "@/features/pricing/creditEstimate";
import { formatVnd } from "@/lib/format";
import type { PaymentPackage } from "@/types/api";

interface PackageGridProps {
    packages: PaymentPackage[];
    highlightedId: string | null;
    /** Admin tạm tắt nạp ⇒ thẻ khoá, không có CTA mua. */
    disabled: boolean;
    ctaLabel: string;
    onChoose: (pkg: PaymentPackage) => void;
}

const fmt = new Intl.NumberFormat("vi-VN");

export function PackageGrid({ packages, highlightedId, disabled, ctaLabel, onChoose }: PackageGridProps) {
    return (
        <ul role="list" aria-label="Gói nạp credit" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
                const featured = pkg.id === highlightedId;
                const unit = vndPerCredit(pkg);
                return (
                    <li
                        key={pkg.id}
                        className={`lift relative flex flex-col rounded-2xl border p-6 ${featured ? "border-app-accent bg-app-surface shadow-xl shadow-app-accent/10 lg:-translate-y-2 lg:scale-[1.02]" : "border-app-border bg-app-bg"} ${disabled ? "opacity-70" : ""}`}
                    >
                        {featured && <div className="absolute -top-3 left-6"><Badge variant="accent">Phổ biến</Badge></div>}
                        <div className="flex items-center justify-between">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${featured ? "bg-app-accent text-white" : "bg-app-accent-soft text-app-accent"}`}>
                                {featured ? <Sparkles className="h-5 w-5" aria-hidden /> : <Coins className="h-5 w-5" aria-hidden />}
                            </span>
                            {unit !== null && <span className="num text-xs text-app-text-muted">{fmt.format(unit)} ₫/credit</span>}
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-app-text">{pkg.label}</h3>
                        <p className="display-md num mt-2 text-app-text">{formatVnd(pkg.amountVnd)}</p>
                        <p className="num mt-1 text-sm text-app-text-secondary">{fmt.format(pkg.credits)} credit · không hết hạn</p>
                        <button
                            type="button"
                            onClick={() => onChoose(pkg)}
                            disabled={disabled}
                            aria-label={`${ctaLabel} ${pkg.label}`}
                            className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 disabled:cursor-not-allowed ${featured ? "bg-app-accent text-app-accent-fg hover:bg-app-accent-hover" : "border border-app-border bg-app-surface text-app-text hover:border-app-accent/40 hover:text-app-accent"}`}
                        >
                            {ctaLabel}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
