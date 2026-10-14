import { useRef, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, AlertTriangle } from "lucide-react";
import { Button, Badge, EmptyState, ErrorPanel, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { usePackages } from "@/hooks/usePackages";
import { usePaymentIntent } from "@/hooks/usePaymentIntent";
import { useFeedback } from "@/hooks/useFeedback";
import { formatCredits, formatVnd } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import type { PaymentPackage } from "@/types/api";
import { PaymentPanel } from "./PaymentPanel";

interface TopupSectionProps { onSwitchTab: (tab: string) => void; }

export function TopupSection({ onSwitchTab }: TopupSectionProps) {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = usePackages();
    const { toast } = useFeedback();
    const [selectedId, setSelectedId] = useState<string | null>(params.get("package"));
    const prevState = useRef<string>("idle");
    const toastRef = useRef(toast);
    useEffect(() => {
        toastRef.current = toast;
    }, [toast]);
    const pi = usePaymentIntent({
        onPaid: (paid) => {
            toastRef.current.success(`Nạp thành công, +${formatCredits(paid.package.credits)} đã được cộng vào số dư.`);
            onSwitchTab("history");
        },
    });
    const { state, intent, create, reset } = pi;

    useEffect(() => {
        if (prevState.current === "creating" && state === "showing" && intent?.isExisting) {
            toastRef.current.info("Bạn đang có lệnh nạp chờ thanh toán, tiếp tục lệnh này");
        }
        prevState.current = state;
    }, [state, intent]);

    const pkgs = data?.packages ?? [];

    const handleCreate = async () => {
        if (!selectedId) return;
        try { await create(selectedId); }
        catch (err) { toast.error(getErrorMessage(err)); }
    };

    if (isLoading) return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
    );

    if (error) return <ErrorPanel message={getErrorMessage(error)} onRetry={() => { void refetch(); }} />;

    if (data && !data.enabled) return (
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-[var(--app-warning)]/30 bg-[var(--app-warning-soft)] px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-warning)]" aria-hidden />
            <p className="flex-1 text-sm text-[var(--app-warning)]">
                Nạp credits tạm thời chưa khả dụng. Vui lòng liên hệ hỗ trợ.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/support")}>Liên hệ hỗ trợ</Button>
        </div>
    );

    if (pkgs.length === 0) return <EmptyState icon={CreditCard} title="Chưa có gói nạp" />;

    if (state !== "idle" && state !== "creating") return (
        <div className="space-y-4">
            {state !== "paid" && (
                <Button variant="ghost" size="sm" onClick={reset}>← Chọn gói khác</Button>
            )}
            <PaymentPanel pi={pi} onSwitchHistory={() => onSwitchTab("history")} />
        </div>
    );

    const mid = Math.floor((pkgs.length - 1) / 2);

    return (
        <div className="space-y-6">
            <div
                role="radiogroup"
                aria-label="Chọn gói nạp"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                onKeyDown={(e) => {
                    const idx = pkgs.findIndex((p) => p.id === selectedId);
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedId(pkgs[(idx + 1) % pkgs.length].id);
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedId(pkgs[(idx - 1 + pkgs.length) % pkgs.length].id);
                    }
                }}
            >
                {pkgs.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} selected={selectedId === pkg.id} popular={i === mid} onSelect={() => setSelectedId(pkg.id)} />
                ))}
            </div>
            {selectedId && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                    <span className="text-sm text-[var(--app-text-secondary)]">
                        {pkgs.find((p) => p.id === selectedId)?.label}
                    </span>
                    <Button loading={state === "creating"} onClick={() => { void handleCreate(); }}>
                        Tiếp tục thanh toán
                    </Button>
                </div>
            )}
        </div>
    );
}

function PackageCard({ pkg, selected, popular, onSelect }: {
    pkg: PaymentPackage; selected: boolean; popular: boolean; onSelect: () => void;
}) {
    const perCredit = pkg.credits > 0 ? (pkg.amountVnd / pkg.credits).toFixed(1) : "—";
    return (
        <div
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onSelect(); } }}
            className={cn(
                "relative cursor-pointer rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40",
                selected
                    ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50",
            )}
        >
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info">Phổ biến</Badge>
                </div>
            )}
            <p className="text-sm font-semibold text-[var(--app-text)]">{pkg.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-[var(--app-text)]">{formatVnd(pkg.amountVnd)}</p>
            <p className="mt-0.5 text-sm text-[var(--app-text-secondary)]">{formatCredits(pkg.credits)}</p>
            <p className="mt-1 text-[11px] text-[var(--app-text-muted)]">{perCredit} ₫/credit</p>
        </div>
    );
}
