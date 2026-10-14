import { useSearchParams } from "react-router-dom";
import { Wallet } from "lucide-react";
import { PageHeader, StatCard, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { useMe } from "@/hooks/useMe";
import { TopupSection } from "./TopupSection";
import { HistorySection } from "./HistorySection";
import { LedgerSection } from "./LedgerSection";

export default function BillingPage() {
    const [params, setParams] = useSearchParams();
    const tab = params.get("tab") ?? "topup";
    const { data } = useMe();

    const setTab = (v: string) => {
        const next = new URLSearchParams(params);
        next.set("tab", v);
        setParams(next, { replace: true });
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            <PageHeader
                title="Nạp credits"
                actions={data ? <StatCard label="Số dư" value={data.balance.display} icon={Wallet} /> : undefined}
            />
            <Tabs value={tab} onChange={setTab} className="mt-6">
                <TabsList>
                    <TabsTrigger value="topup">Nạp credits</TabsTrigger>
                    <TabsTrigger value="history">Lịch sử nạp</TabsTrigger>
                    <TabsTrigger value="ledger">Sao kê</TabsTrigger>
                </TabsList>
                <div className="mt-6">
                    <TabsContent value="topup"><TopupSection onSwitchTab={setTab} /></TabsContent>
                    <TabsContent value="history"><HistorySection /></TabsContent>
                    <TabsContent value="ledger"><LedgerSection /></TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
