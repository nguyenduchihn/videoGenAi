import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Layers } from "lucide-react";
import { Button, EmptyState, ErrorPanel, Skeleton } from "@/components/ui";
import { PaymentPanel } from "@/features/billing/PaymentPanel";
import { useFeedback } from "@/hooks/useFeedback";
import { usePaymentIntent } from "@/hooks/usePaymentIntent";
import { usePricing } from "@/hooks/usePricing";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { qk } from "@/lib/queryClient";
import type { PortalMeResponse, PricingPlan } from "@/types/api";
import { nextExpiryAfterPurchase, planExpiry, planFeatures, priceLabel } from "./planCopy";

interface PlanPurchaseSectionProps {
    me: PortalMeResponse;
    onPaid: () => void;
    onSwitchHistory: () => void;
}

/** Tab "Mua / Gia hạn": chọn gói đang bán (radiogroup) ⇒ lệnh chuyển khoản (PaymentPanel dùng chung với nạp credit) ⇒ paid ⇒ gói mới. */
export function PlanPurchaseSection({ me, onPaid, onSwitchHistory }: PlanPurchaseSectionProps) {
    const [params] = useSearchParams();
    const pricing = usePricing();
    const qc = useQueryClient();
    const { toast } = useFeedback();
    const toastRef = useRef(toast);
    useEffect(() => { toastRef.current = toast; }, [toast]);
    const onPaidRef = useRef(onPaid);
    useEffect(() => { onPaidRef.current = onPaid; }, [onPaid]);
    const plans = pricing.data?.plans ?? [];
    const [selectedId, setSelectedId] = useState<string | null>(params.get("buy") ?? me.user.planId);
    const pi = usePaymentIntent({
        onPaid: (paid) => {
            toastRef.current.success(`Đã kích hoạt gói ${paid.package.label}.`);
            void qc.invalidateQueries({ queryKey: qk.me });
            onPaidRef.current();
        },
    });
    const { state, createPlan, reset } = pi;
    /** Ref theo id gói để phím mũi tên chuyển cả focus (WAI-ARIA radiogroup: focus đi theo lựa chọn). */
    const optionRefs = useRef(new Map<string, HTMLDivElement>());

    if (pricing.isLoading) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}</div>;
    if (pricing.error) return <ErrorPanel message={getErrorMessage(pricing.error)} onRetry={() => { void pricing.refetch(); }} />;
    if (plans.length === 0) return <EmptyState icon={Layers} title="Chưa có gói nào mở bán" description="Quản trị viên chưa đặt giá cho gói. Vui lòng liên hệ hỗ trợ." />;

    if (state !== "idle" && state !== "creating") {
        return (
            <div className="space-y-4">
                {state !== "paid" && <Button variant="ghost" size="sm" onClick={reset}>← Chọn gói khác</Button>}
                <PaymentPanel pi={pi} onSwitchHistory={onSwitchHistory} />
            </div>
        );
    }

    const selected = plans.find((p) => p.id === selectedId) ?? null;
    const e = planExpiry(me.user.planExpiresAt);
    const renewSame = selected !== null && selected.id === me.user.planId && e.state !== "expired";
    const nextExpiry = selected ? nextExpiryAfterPurchase(me.user.planExpiresAt, selected.periodDays) : null;
    const move = (delta: number) => {
        const idx = plans.findIndex((p) => p.id === selectedId);
        const nextId = plans[(idx + delta + plans.length) % plans.length]!.id;
        setSelectedId(nextId);
        requestAnimationFrame(() => optionRefs.current.get(nextId)?.focus());
    };
    return (
        <div className="space-y-6">
            <div
                role="radiogroup"
                aria-label="Chọn gói dịch vụ"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                onKeyDown={(event) => {
                    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); move(1); }
                    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); move(-1); }
                }}
            >
                {plans.map((plan) => (
                    <PlanOption
                        key={plan.id}
                        plan={plan}
                        selected={selectedId === plan.id}
                        current={plan.id === me.user.planId}
                        onSelect={() => setSelectedId(plan.id)}
                        elRef={(el) => { if (el) optionRefs.current.set(plan.id, el); else optionRefs.current.delete(plan.id); }}
                    />
                ))}
            </div>
            {selected && (
                <div className="flex flex-col gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--app-text-secondary)]">
                        <span className="font-medium text-[var(--app-text)]">{selected.name}</span> · {priceLabel(selected)}
                        {nextExpiry && (
                            <span className="block text-xs text-[var(--app-text-muted)]">
                                {renewSame ? `Gia hạn cộng thêm ${selected.periodDays} ngày vào hạn hiện tại ⇒ đến ${formatDate(nextExpiry.toISOString())}.` : `Có hiệu lực ngay sau khi thanh toán, đến ${formatDate(nextExpiry.toISOString())}.`}
                            </span>
                        )}
                    </p>
                    <Button loading={state === "creating"} onClick={() => { createPlan(selected.id).catch((err: unknown) => toast.error(getErrorMessage(err))); }}>
                        {renewSame ? "Gia hạn gói" : "Tiếp tục thanh toán"}
                    </Button>
                </div>
            )}
        </div>
    );
}

function PlanOption({ plan, selected, current, onSelect, elRef }: { plan: PricingPlan; selected: boolean; current: boolean; onSelect: () => void; elRef: (el: HTMLDivElement | null) => void }) {
    return (
        <div
            ref={elRef}
            role="radio"
            aria-checked={selected}
            aria-label={`${plan.name}, ${priceLabel(plan)}${current ? ", gói của bạn" : ""}`}
            tabIndex={selected ? 0 : -1}
            onClick={onSelect}
            onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); onSelect(); } }}
            className={cn(
                "relative min-h-11 cursor-pointer rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40",
                selected ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]" : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50",
            )}
        >
            {/* Dấu chọn không chỉ bằng màu (WCAG 1.4.1) */}
            <span aria-hidden="true" className={cn("absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition", selected ? "border-[var(--app-accent)] bg-[var(--app-accent)]" : "border-[var(--app-border)] bg-transparent")}>
                {selected && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
            </span>
            {current && <span aria-hidden="true" className="absolute right-3 top-3 rounded-full bg-[var(--app-accent)] px-2 py-0.5 text-[10px] font-semibold text-white">Gói của bạn</span>}
            <p className="pl-7 text-sm font-semibold text-[var(--app-text)]">{plan.name}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-[var(--app-text)]">{priceLabel(plan)}</p>
            <ul className="mt-2 space-y-0.5 text-[11px] text-[var(--app-text-secondary)]">
                {planFeatures(plan).map((line) => <li key={line}>• {line}</li>)}
            </ul>
        </div>
    );
}
