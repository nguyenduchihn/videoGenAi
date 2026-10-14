import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentIntent } from "@/hooks/usePaymentIntent";
import { Button, CopyButton, ErrorPanel, Spinner } from "@/components/ui";
import { formatVnd, formatCredits, formatDate } from "@/lib/format";
import type { PaymentIntent } from "@/types/api";

type PIHook = ReturnType<typeof usePaymentIntent>;

interface PaymentPanelProps { pi: PIHook; onSwitchHistory: () => void; }

export function PaymentPanel({ pi, onSwitchHistory }: PaymentPanelProps) {
    const { state, intent, remainingMs, pollError, pausedUntil, createAnother, resumePolling } = pi;
    if (!intent) return null;
    if (state === "showing") return <PendingState intent={intent} remainingMs={remainingMs} pollError={pollError} pausedUntil={pausedUntil} resumePolling={resumePolling} />;
    if (state === "paid") return <PaidState intent={intent} onSwitchHistory={onSwitchHistory} />;
    if (state === "expired") return <ExpiredState intent={intent} onNew={() => { void createAnother(); }} />;
    if (state === "failed") return <FailedState intent={intent} onNew={() => { void createAnother(); }} />;
    if (state === "cancelled") return <CancelledState intent={intent} onNew={() => { void createAnother(); }} />;
    return null;
}

/** Giây còn lại tới mốc `until` (null ⇒ 0), cập nhật mỗi giây. */
function useSecondsUntil(until: number | null): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!until) return;
        const timer = setInterval(() => setNow(Date.now()), 1_000);
        return () => clearInterval(timer);
    }, [until]);
    return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}

function fmtMs(ms: number): string {
    const t = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function PendingState({ intent, remainingMs, pollError, pausedUntil, resumePolling }: {
    intent: PaymentIntent; remainingMs: number; pollError: string | null;
    pausedUntil: number | null; resumePolling: () => void;
}) {
    const warn = remainingMs > 0 && remainingMs < 5 * 60 * 1000;
    const pauseSec = useSecondsUntil(pausedUntil);
    const rows: { label: string; value: string; copy: boolean; hi?: boolean }[] = [
        { label: "Ngân hàng", value: intent.bankInfo.bank, copy: false },
        { label: "Số tài khoản", value: intent.bankInfo.accountNumber, copy: true },
        { label: "Chủ tài khoản", value: intent.bankInfo.accountName, copy: false },
        { label: "Số tiền", value: formatVnd(intent.package.amountVnd), copy: true },
        { label: "Nội dung", value: intent.code, copy: true, hi: true },
    ];
    return (
        <div className="space-y-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                <div className="flex justify-center">
                    <div className="rounded-lg bg-white p-2.5 shadow-sm">
                        <img src={intent.qrImageUrl} alt={`Mã QR thanh toán ${intent.package.label} ${formatVnd(intent.package.amountVnd)}`} width={164} height={164} className="block" />
                    </div>
                </div>
                <div className="space-y-2.5">
                    {rows.map((r) => (
                        <div key={r.label} className="flex items-start justify-between gap-3 text-sm">
                            <span className="shrink-0 text-[var(--app-text-muted)]">{r.label}</span>
                            <span className="flex min-w-0 items-center gap-1.5">
                                {r.hi
                                    ? <code className="rounded bg-[var(--app-accent-soft)] px-1.5 py-0.5 font-mono text-xs text-[var(--app-accent)]">{r.value}</code>
                                    : <span className="break-all font-medium text-[var(--app-text)]">{r.value}</span>
                                }
                                {r.copy && <CopyButton value={r.value} label={`Sao chép ${r.label}`} />}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div aria-live="polite" aria-atomic="true" className={`text-center text-2xl font-bold tabular-nums ${warn ? "text-[var(--app-warning)]" : "text-[var(--app-text)]"}`}>
                {fmtMs(remainingMs)}
            </div>
            {pauseSec > 0 && (
                <p className="text-center text-xs text-[var(--app-info)]">
                    Đang tạm dừng kiểm tra (quá nhiều yêu cầu), tiếp tục sau {pauseSec} s
                </p>
            )}
            {pollError
                ? <ErrorPanel message={pollError} onRetry={resumePolling} />
                : (
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--app-text-secondary)]">
                        <Spinner size="sm" />
                        Đang chờ thanh toán…
                    </div>
                )
            }
            <p className="rounded-lg bg-[var(--app-surface-soft)] px-3 py-2 text-xs text-[var(--app-text-secondary)]">
                Chuyển ĐÚNG số tiền và nội dung; credits cộng tự động trong vài giây sau khi chuyển.
            </p>
        </div>
    );
}

function PaidState({ intent, onSwitchHistory }: { intent: PaymentIntent; onSwitchHistory: () => void }) {
    const navigate = useNavigate();
    return (
        <div className="space-y-3 rounded-xl border border-[var(--app-success)]/30 bg-[var(--app-success-soft)] p-5 text-center">
            <p className="text-lg font-semibold text-[var(--app-success)]">+{formatCredits(intent.package.credits)} đã được cộng</p>
            {intent.paidAt && <p className="text-xs text-[var(--app-text-secondary)]">{formatDate(intent.paidAt)}</p>}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="secondary" onClick={onSwitchHistory}>Xem lịch sử nạp</Button>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Về Dashboard</Button>
            </div>
        </div>
    );
}

function ExpiredState({ intent, onNew }: { intent: PaymentIntent; onNew: () => void }) {
    return (
        <div className="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-center">
            <p className="text-sm text-[var(--app-text-secondary)]">Lệnh thanh toán {intent.package.label} đã hết hạn.</p>
            <Button onClick={onNew}>Tạo lệnh mới</Button>
        </div>
    );
}

function FailedState({ intent, onNew }: { intent: PaymentIntent; onNew: () => void }) {
    const msg = intent.failureReason === "amount_mismatch"
        ? "Số tiền chuyển không khớp. Admin sẽ đối soát và cộng credits thủ công, hoặc liên hệ hỗ trợ."
        : "Thanh toán thất bại. Vui lòng thử lại.";
    return (
        <div className="space-y-3 rounded-xl border border-[var(--app-danger)]/30 bg-[var(--app-danger-soft)] p-5">
            <p className="text-sm text-[var(--app-danger)]">{msg}</p>
            {intent.failureReason !== "amount_mismatch" && <Button onClick={onNew}>Thử lại</Button>}
        </div>
    );
}

function CancelledState({ intent, onNew }: { intent: PaymentIntent; onNew: () => void }) {
    return (
        <div className="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
            {intent.cancellationReason && (
                <p className="text-sm text-[var(--app-text-secondary)]">{intent.cancellationReason}</p>
            )}
            <Button onClick={onNew}>Tạo lệnh mới</Button>
        </div>
    );
}
