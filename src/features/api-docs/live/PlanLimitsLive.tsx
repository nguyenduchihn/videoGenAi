import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import { Callout } from "../components/Callout";
import { DataTable } from "../components/DataTable";

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-app-border bg-app-surface px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-app-text-secondary">{label}</dt>
            <dd className="docs-display mt-1 text-2xl font-bold tabular-nums text-app-text">{value}</dd>
        </div>
    );
}

/** Đăng nhập ⇒ giới hạn THẬT của gói mình; chưa đăng nhập + bán gói ⇒ bảng các gói; còn lại ⇒ chỉ dẫn GET /v1/me. */
export function PlanLimitsLive({ fallback }: { fallback: string }) {
    const plan = useAuthStore((s) => s.user?.plan ?? null);
    const plans = usePricing().data?.plans ?? [];
    if (plan) {
        return (
            <div className="space-y-2">
                <p className="text-sm text-app-text-secondary">Gói của bạn: <strong className="font-semibold text-app-text">{plan.name}</strong></p>
                <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Stat label="Job đồng thời" value={String(plan.maxConcurrent)} />
                    <Stat label="Task chờ tối đa" value={String(plan.maxPending)} />
                    <Stat label="POST / giây" value={String(plan.ratePerSec)} />
                    <Stat label="GET / giây" value={String(plan.statusRatePerSec)} />
                </dl>
            </div>
        );
    }
    if (plans.length > 0) {
        return (
            <DataTable
                caption="Giới hạn theo gói"
                head={["Gói", "Job đồng thời", "Task chờ tối đa", "Video / ngày"]}
                rows={plans.map((p) => [p.name, String(p.maxConcurrent), String(p.maxPending), p.fairUsePerDay === null ? "không giới hạn" : String(p.fairUsePerDay)])}
            />
        );
    }
    return <Callout tone="info" text={fallback} />;
}
