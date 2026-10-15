import { useState } from "react";
import { DataList, Sheet, StatusBadge, CopyButton } from "@/components/ui";
import { useIntents } from "@/hooks/useIntents";
import { formatDate, formatVnd, formatCredits } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import type { PaymentIntent } from "@/types/api";

export function HistorySection() {
    const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useIntents();
    const [selected, setSelected] = useState<PaymentIntent | null>(null);
    const items = data?.pages.flatMap((p) => p.items) ?? [];

    return (
        <>
            <DataList
                items={items}
                loading={isLoading}
                error={error ? getErrorMessage(error) : null}
                onRetry={() => { void refetch(); }}
                emptyTitle="Chưa có lịch sử nạp"
                hasMore={hasNextPage}
                loadMore={() => { void fetchNextPage(); }}
                loadingMore={isFetchingNextPage}
                renderItem={(intent) => (
                    <div key={intent.intentId} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="truncate text-sm font-medium text-[var(--app-text)]">{intent.package.label}</p>
                            <p className="text-xs text-[var(--app-text-muted)]">
                                {formatDate(intent.createdAt)} · {formatVnd(intent.package.amountVnd)} · {formatCredits(intent.package.credits)}
                            </p>
                        </div>
                        <StatusBadge kind="intent" status={intent.expired && intent.status === "pending" ? "expired" : intent.status} />
                        <button type="button" onClick={() => setSelected(intent)} className="text-xs font-medium text-[var(--app-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 rounded">
                            Xem
                        </button>
                    </div>
                )}
            />
            <Sheet open={!!selected} onClose={() => setSelected(null)} title="Chi tiết lệnh nạp">
                {selected && <IntentDetail intent={selected} />}
            </Sheet>
        </>
    );
}

function IntentDetail({ intent }: { intent: PaymentIntent }) {
    const isPending = intent.status === "pending" && !intent.expired;
    const rows: { label: string; value: string; copy?: boolean }[] = [
        { label: "Mã giao dịch", value: intent.code, copy: true },
        { label: "Ngân hàng", value: intent.bankInfo.bank },
        { label: "Số tài khoản", value: intent.bankInfo.accountNumber, copy: true },
        { label: "Chủ tài khoản", value: intent.bankInfo.accountName },
        { label: "Số tiền", value: formatVnd(intent.package.amountVnd), copy: true },
        ...(intent.paidAt ? [{ label: "Thanh toán lúc", value: formatDate(intent.paidAt) }] : []),
    ];
    return (
        <div className="space-y-3 text-sm">
            {rows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-[var(--app-text-muted)]">{r.label}</span>
                    <span className="flex items-center gap-1.5 text-right">
                        <span className="font-medium text-[var(--app-text)]">{r.value}</span>
                        {r.copy && <CopyButton value={r.value} label={`Sao chép ${r.label}`} />}
                    </span>
                </div>
            ))}
            {intent.failureReason && (
                <p className="rounded-lg bg-[var(--app-danger-soft)] px-3 py-2 text-[var(--app-danger)]">{intent.failureReason}</p>
            )}
            {intent.cancellationReason && (
                <p className="rounded-lg bg-[var(--app-surface-soft)] px-3 py-2 text-[var(--app-text-secondary)]">{intent.cancellationReason}</p>
            )}
            {isPending && (
                <div className="flex justify-center rounded-lg bg-white p-3">
                    <img src={intent.qrImageUrl} alt={`Mã QR ${intent.code}`} width={140} height={140} className="block" />
                </div>
            )}
        </div>
    );
}
