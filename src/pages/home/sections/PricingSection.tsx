import { AlertTriangle, ArrowRight, QrCode, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { PlanCard } from "@/features/plan/PlanCard";
import { vndPerCredit } from "@/features/pricing/creditEstimate";
import { useCommercialMode } from "@/hooks/useCommercialMode";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import type { PaymentPackage, PortalPricingResponse } from "@/types/api";
import { useReveal } from "../useReveal";
import { CreditCostTable } from "./CreditCostTable";
import { CreditEstimator } from "./CreditEstimator";
import { PackageGrid } from "./PackageGrid";

const SHOWN_PACKAGES = 3;
const middleOf = <T,>(list: T[]): T | undefined => list[Math.floor(list.length / 2)]; // 3 ⇒ giữa; 2 ⇒ gói cao hơn

function PricingSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải bảng giá">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
    );
}

function PaygBlock({ data, loggedIn }: { data: PortalPricingResponse; loggedIn: boolean }) {
    const navigate = useNavigate();
    const shown = data.packages.slice(0, SHOWN_PACKAGES);
    const highlighted = middleOf(shown) ?? null;
    const disabled = !data.topupEnabled;
    const choose = (pkg: PaymentPackage) => navigate(loggedIn ? `/billing?package=${pkg.id}` : "/register");
    if (shown.length === 0) return <EmptyState title="Chưa có gói nạp" description="Quản trị viên chưa cấu hình gói nạp. Vui lòng quay lại sau." />;
    return (
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div>
                {disabled && (
                    <div role="status" className="mb-5 flex flex-wrap items-start gap-3 rounded-xl border border-app-warning/30 bg-app-warning-soft px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-app-warning" aria-hidden />
                        <p className="flex-1 text-sm text-app-warning">Nạp credit tạm thời chưa khả dụng. Bảng giá vẫn hiển thị để bạn tham khảo.</p>
                        <Button variant="outline" size="sm" onClick={() => navigate("/support")}>Liên hệ hỗ trợ</Button>
                    </div>
                )}
                <PackageGrid packages={shown} highlightedId={highlighted?.id ?? null} disabled={disabled} ctaLabel={loggedIn ? "Nạp gói này" : "Bắt đầu với gói này"} onChoose={choose} />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="inline-flex items-center gap-2 text-app-text-secondary">
                        <QrCode className="h-4 w-4 text-app-accent" aria-hidden />
                        Chuyển khoản ngân hàng nội địa qua VietQR · credit cộng tự động trong vài phút
                    </p>
                    {data.packages.length > SHOWN_PACKAGES && (
                        <Link to="/pricing" className="inline-flex items-center gap-1 font-semibold text-app-accent hover:underline">
                            Xem đủ {data.packages.length} gói <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <CreditCostTable workers={data.workers} vndPerCreditValue={highlighted ? vndPerCredit(highlighted) : null} />
                <CreditEstimator workers={data.workers} packages={data.packages} />
            </div>
        </div>
    );
}

function PlansBlock({ data, loggedIn }: { data: PortalPricingResponse; loggedIn: boolean }) {
    const navigate = useNavigate();
    const highlighted = middleOf(data.plans);
    if (data.plans.length === 0) return <EmptyState title="Chưa có gói nào mở bán" description="Quản trị viên chưa đặt giá cho gói dịch vụ. Vui lòng quay lại sau." />;
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} highlighted={plan.id === highlighted?.id} ctaLabel="Chọn gói" onChoose={() => navigate(loggedIn ? `/my-plan?buy=${plan.id}` : "/register")} />
                ))}
            </div>
            <details className="rounded-2xl border border-app-border bg-app-bg p-5">
                <summary className="cursor-pointer text-sm font-semibold text-app-text">Chi phí credit theo lượt tạo (gói có trừ credit)</summary>
                <div className="mt-4"><CreditCostTable workers={data.workers} vndPerCreditValue={null} /></div>
            </details>
        </div>
    );
}

export function PricingSection() {
    const { data, isError, refetch } = usePricing();
    const mode = useCommercialMode();
    const loggedIn = useAuthStore((s) => s.user !== null);
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    const ready = !!data && mode !== null;
    const subscription = mode === "subscription";
    const trial = data?.trialDays ?? 0;

    return (
        <section id="bang-gia" aria-labelledby="pricing-heading" className="scroll-mt-20 border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                <div ref={headRef} className={`${headClass} max-w-2xl`}>
                    <p className="eyebrow text-app-accent">Bảng giá</p>
                    <h2 id="pricing-heading" className="display-lg mt-4 text-app-text">
                        {subscription ? <>Chọn gói <span className="text-app-accent">phù hợp với bạn.</span></> : <>Nạp credit. Dùng ngay. <span className="text-app-accent">Không hết hạn.</span></>}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-app-text-secondary sm:text-base">
                        {subscription
                            ? `Mua gói theo kỳ, kích hoạt tự động sau khi chuyển khoản; gia hạn trước hạn được cộng dồn ngày.${trial > 0 ? ` Tài khoản mới dùng thử ${trial} ngày.` : ""}`
                            : "Trả theo lượt tạo, không phí tháng. Credit của bạn không có hạn dùng; mỗi chế độ có giá riêng, hiện ở bảng bên."}
                    </p>
                </div>
                <div className="mt-12">
                    {isError && !data ? (
                        <div className="rounded-2xl border border-app-border bg-app-bg p-6 text-center">
                            <p className="text-sm text-app-text-secondary">Không tải được bảng giá lúc này.</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => void refetch()}><RefreshCw className="h-3.5 w-3.5" aria-hidden />Thử lại</Button>
                                <Link to="/pricing" className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-app-accent hover:underline">Mở trang bảng giá</Link>
                            </div>
                        </div>
                    ) : !ready ? (
                        <PricingSkeleton />
                    ) : subscription ? (
                        <PlansBlock data={data} loggedIn={loggedIn} />
                    ) : (
                        <PaygBlock data={data} loggedIn={loggedIn} />
                    )}
                </div>
            </div>
        </section>
    );
}
