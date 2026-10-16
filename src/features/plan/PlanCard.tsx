import { Check, Layers } from "lucide-react";
import { Badge } from "@/components/ui";
import type { PricingPlan } from "@/types/api";
import { planFeatures, priceLabel } from "./planCopy";

interface PlanCardProps {
    plan: PricingPlan;
    /** Gói khách đang dùng ⇒ badge + nút Gia hạn. */
    current?: boolean;
    highlighted?: boolean;
    ctaLabel: string;
    onChoose: () => void;
}

/** Thẻ gói dịch vụ trên trang giá (subscription). */
export function PlanCard({ plan, current = false, highlighted = false, ctaLabel, onChoose }: PlanCardProps) {
    return (
        <article aria-label={`Gói ${plan.name}`} className={`relative flex flex-col rounded-2xl border bg-[var(--app-surface)] p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 ${highlighted ? "border-[var(--app-accent)]" : "border-[var(--app-border)] hover:border-[var(--app-accent)]/30"}`}>
            {current && <div className="absolute -top-3 left-6"><Badge variant="accent">Gói của bạn</Badge></div>}
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-accent-soft)]">
                <Layers className="h-5 w-5 text-[var(--app-accent)]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--app-text)]">{plan.name}</h3>
            {plan.description && <p className="mt-1 text-sm text-[var(--app-text-secondary)]">{plan.description}</p>}
            <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--app-text)]">{priceLabel(plan)}</p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-[var(--app-border)] pt-5">
                {planFeatures(plan).map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-xs text-[var(--app-text-secondary)]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--app-success-soft)]"><Check className="h-3 w-3 text-[var(--app-success)]" aria-hidden="true" /></span>
                        {line}
                    </li>
                ))}
            </ul>
            <button type="button" onClick={onChoose} aria-label={`${ctaLabel} ${plan.name}`} className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]">
                {ctaLabel}
            </button>
        </article>
    );
}
