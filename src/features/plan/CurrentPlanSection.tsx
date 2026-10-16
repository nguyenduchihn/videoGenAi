import { AlertTriangle, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, EmptyState } from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/format";
import type { PortalMeResponse } from "@/types/api";
import { expiryText, planChargesCredits, planExpiry, planFeatures } from "./planCopy";

interface CurrentPlanSectionProps {
    me: PortalMeResponse;
    onRenew: () => void;
}

/** Tab "Gói hiện tại": hạn, giới hạn, fair-use hôm nay hoặc credit theo gói; banner sắp hết hạn / hết hạn với nút Gia hạn. */
export function CurrentPlanSection({ me, onRenew }: CurrentPlanSectionProps) {
    const navigate = useNavigate();
    const { plan, user, usage, balance } = me;
    if (!plan) {
        return <EmptyState icon={Layers} title="Bạn chưa có gói dịch vụ" description="Mua gói để bắt đầu tạo video AI với tốc độ cao và ổn định." action={<Button onClick={() => navigate("/pricing")}>Xem các gói →</Button>} />;
    }
    const e = planExpiry(user.planExpiresAt);
    const charges = planChargesCredits(plan);
    const fairUseLimit = user.fairUsePerDayOverride ?? plan.fairUsePerDay;
    const rows: Array<{ label: string; value: string }> = [
        { label: "Hạn sử dụng", value: e.state === "none" ? "Không thời hạn" : `${formatDate(e.at)} · ${expiryText(e)}` },
        { label: "Task đồng thời", value: String(user.maxConcurrentOverride ?? plan.maxConcurrent) },
        { label: "Hàng đợi tối đa", value: (user.maxPendingOverride ?? plan.maxPending).toLocaleString("vi-VN") },
    ];
    if (!charges) {
        rows.push({ label: "Lượt tạo video hôm nay", value: fairUseLimit ? `${usage.fairUseToday.toLocaleString("vi-VN")} / ${fairUseLimit.toLocaleString("vi-VN")}` : `${usage.fairUseToday.toLocaleString("vi-VN")} (không giới hạn)` });
    } else {
        rows.push({ label: plan.monthlyCredits > 0 ? "Credit theo gói còn lại" : "Số dư credit", value: formatCredits(balance.raw) });
    }
    const alert = e.state === "expired" || e.state === "soon";
    return (
        <div className="space-y-4">
            {alert && (
                <div role={e.state === "expired" ? "alert" : "status"} className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${e.state === "expired" ? "border-[var(--app-danger)]/40 bg-[var(--app-danger-soft)]" : "border-[var(--app-warning)]/40 bg-[var(--app-warning-soft)]"}`}>
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${e.state === "expired" ? "text-[var(--app-danger)]" : "text-[var(--app-warning)]"}`} aria-hidden="true" />
                    <p className="flex-1 text-sm text-[var(--app-text)]">
                        {e.state === "expired" ? `Gói của bạn đã hết hạn ngày ${formatDate(e.at)}. Mọi lượt tạo mới đang tạm dừng.` : `Gói hết hạn sau ${e.daysLeft} ngày (${formatDate(e.at)}). Gia hạn để không bị gián đoạn.`}
                    </p>
                    <Button size="sm" onClick={onRenew}>Gia hạn ngay</Button>
                </div>
            )}
            <section aria-label="Gói hiện tại" className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-[var(--app-text-muted)]">Gói đang dùng</p>
                        <h2 className="mt-1 text-xl font-semibold text-[var(--app-text)]">{plan.name}</h2>
                        {plan.description && <p className="mt-1 text-sm text-[var(--app-text-secondary)]">{plan.description}</p>}
                    </div>
                    <Button variant="secondary" onClick={onRenew}>{e.state === "expired" ? "Gia hạn gói" : "Gia hạn / đổi gói"}</Button>
                </div>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    {rows.map((r) => (
                        <div key={r.label} className="rounded-xl bg-[var(--app-surface-soft)] px-4 py-3">
                            <dt className="text-xs text-[var(--app-text-muted)]">{r.label}</dt>
                            <dd className="mt-1 text-base font-semibold text-[var(--app-text)]">{r.value}</dd>
                        </div>
                    ))}
                </dl>
                {!charges && fairUseLimit !== null && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-[var(--app-text-secondary)]"><span>Fair-use hôm nay</span><span>{usage.fairUseToday.toLocaleString("vi-VN")} / {fairUseLimit.toLocaleString("vi-VN")}</span></div>
                        <div role="progressbar" aria-label="Lượt tạo video hôm nay" aria-valuemin={0} aria-valuemax={fairUseLimit} aria-valuenow={Math.min(usage.fairUseToday, fairUseLimit)} className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
                            <div className="h-full origin-left rounded-full bg-[var(--app-accent)] motion-safe:transition-transform motion-safe:duration-500" style={{ transform: `scaleX(${Math.min(1, usage.fairUseToday / fairUseLimit)})` }} />
                        </div>
                    </div>
                )}
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--app-text-secondary)]">
                    {planFeatures(plan).map((line) => <li key={line}>• {line}</li>)}
                </ul>
            </section>
        </div>
    );
}
