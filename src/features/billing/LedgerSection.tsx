import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { DataList, StatCard } from "@/components/ui";
import { useLedger } from "@/hooks/useLedger";
import { formatCredits, formatRelativeTime } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { LEDGER_KIND_LABELS } from "./ledgerKinds";

const fmtNum = new Intl.NumberFormat("vi-VN");

export function LedgerSection() {
    const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useLedger();
    const items = data?.pages.flatMap((p) => p.items) ?? [];
    const balance = data?.pages[0]?.balance ?? 0;

    return (
        <div className="space-y-4">
            {data && <StatCard label="Số dư hiện tại" value={formatCredits(balance)} icon={Coins} />}
            <DataList
                items={items}
                loading={isLoading}
                error={error ? getErrorMessage(error) : null}
                onRetry={() => { void refetch(); }}
                emptyTitle="Chưa có giao dịch"
                hasMore={hasNextPage}
                loadMore={() => { void fetchNextPage(); }}
                loadingMore={isFetchingNextPage}
                renderItem={(item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-sm font-medium text-[var(--app-text)]">
                                {LEDGER_KIND_LABELS[item.kind] ?? item.kind}
                                {item.note && <span className="ml-1 text-[var(--app-text-muted)]">· {item.note}</span>}
                            </p>
                            {item.taskId && (
                                <Link to={`/tasks?id=${item.taskId}`} className="text-xs text-[var(--app-accent)] hover:underline">
                                    Xem tác vụ
                                </Link>
                            )}
                            <p className="text-xs text-[var(--app-text-muted)]">{formatRelativeTime(item.createdAt)}</p>
                        </div>
                        <div className="shrink-0 text-right tabular-nums">
                            <p className={`text-sm font-semibold ${item.delta >= 0 ? "text-[var(--app-success)]" : "text-[var(--app-danger)]"}`}>
                                {item.delta >= 0 ? "+" : ""}{fmtNum.format(item.delta)}
                            </p>
                            {item.balanceAfter !== null && <p className="text-xs text-[var(--app-text-muted)]">Số dư: {formatCredits(item.balanceAfter)}</p>}
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
