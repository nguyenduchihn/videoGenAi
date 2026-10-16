import { useSearchParams } from "react-router-dom";
import { Badge, PageHeader, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { HistorySection } from "@/features/billing/HistorySection";
import { LedgerSection } from "@/features/billing/LedgerSection";
import { useMe } from "@/hooks/useMe";
import { CurrentPlanSection } from "./CurrentPlanSection";
import { PlanPurchaseSection } from "./PlanPurchaseSection";
import { planChargesCredits, planStatus } from "./planCopy";

const TABS = ["current", "buy", "history", "ledger"] as const;
type PlanTab = (typeof TABS)[number];
const isTab = (v: string | null): v is PlanTab => (TABS as readonly string[]).includes(v ?? "");

/** Trang "Gói của tôi" (chế độ bán gói dịch vụ): gói hiện tại · mua / gia hạn · lịch sử · sao kê. ?buy=<planId> mở sẵn tab mua. */
export default function MyPlanPage() {
    const [params, setParams] = useSearchParams();
    const tab: PlanTab = isTab(params.get("tab")) ? (params.get("tab") as PlanTab) : params.get("buy") ? "buy" : "current";
    const { data: me } = useMe();
    const setTab = (v: string) => {
        const next = new URLSearchParams(params);
        next.set("tab", v);
        next.delete("buy");
        setParams(next, { replace: true });
    };
    const status = me ? planStatus(me) : null;
    const tone = status?.tone === "danger" ? "danger" : status?.tone === "warning" ? "warning" : status?.tone === "success" ? "success" : "default";
    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            <PageHeader title="Gói của tôi" description="Mua hoặc gia hạn gói dịch vụ bằng chuyển khoản ngân hàng; hạn gói cộng dồn khi gia hạn trước ngày hết hạn." actions={status ? <Badge variant={tone} dot>{status.label}</Badge> : undefined} />
            <Tabs value={tab} onChange={setTab} className="mt-6">
                <TabsList>
                    <TabsTrigger value="current">Gói hiện tại</TabsTrigger>
                    <TabsTrigger value="buy">Mua / Gia hạn</TabsTrigger>
                    <TabsTrigger value="history">Lịch sử</TabsTrigger>
                    <TabsTrigger value="ledger">Sao kê</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="current">{me ? <CurrentPlanSection me={me} onRenew={() => setTab("buy")} /> : <Skeleton className="h-48" />}</TabsContent>
                    <TabsContent value="buy">{me ? <PlanPurchaseSection me={me} onPaid={() => setTab("current")} onSwitchHistory={() => setTab("history")} /> : <Skeleton className="h-48" />}</TabsContent>
                    <TabsContent value="history"><HistorySection kind="plan_purchase" /></TabsContent>
                    <TabsContent value="ledger">
                        {me && !planChargesCredits(me.plan) && (
                            <p className="mb-4 rounded-xl bg-[var(--app-surface-soft)] px-4 py-3 text-sm text-[var(--app-text-secondary)]">Gói của bạn không trừ credit theo lượt tạo; sao kê chỉ có dòng khi được tặng hoặc điều chỉnh credit.</p>
                        )}
                        <LedgerSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
