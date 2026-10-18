import { Eye, EyeOff, RefreshCw, Webhook, type LucideIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button, CopyButton, Skeleton } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { useRotateWebhookSecret, useWebhookSecret } from "../webhookSecret.api";

const mask = (s: string) => `${s.slice(0, 10)}${"•".repeat(24)}${s.slice(-4)}`;

export function Panel({ icon: Icon, title, desc, children }: { icon: LucideIcon; title: string; desc: string; children: ReactNode }) {
    const headingId = useId();
    return (
        <section aria-labelledby={headingId} className="rounded-2xl border border-app-border bg-app-surface p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent"><Icon className="h-4 w-4" aria-hidden /></span>
                <div>
                    <h2 id={headingId} className="text-base font-semibold text-app-text">{title}</h2>
                    <p className="mt-0.5 text-sm leading-6 text-app-text-secondary">{desc}</p>
                </div>
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

/** Xem (che mặc định) / sao chép / xoay khoá ký webhook. Dùng ở /api-docs?tab=config và /settings/api-keys. */
export function WebhookSecretPanel() {
    const { toast, confirm } = useFeedback();
    const [revealed, setRevealed] = useState(false);
    const query = useWebhookSecret(true);
    const rotate = useRotateWebhookSecret();

    const onRotate = async () => {
        const ok = await confirm({
            title: "Xoay khoá ký webhook?",
            body: "Webhook gửi từ bây giờ ký bằng khoá mới. Server của bạn phải cập nhật khoá ngay, nếu không sẽ từ chối webhook.",
            confirmLabel: "Xoay khoá",
            danger: true,
        });
        if (!ok) return;
        rotate.mutate(undefined, {
            onSuccess: () => { setRevealed(true); toast.success("Đã tạo khoá mới. Hãy cập nhật server của bạn."); },
            onError: (e) => toast.error(getErrorMessage(e)),
        });
    };

    return (
        <Panel icon={Webhook} title="Khoá ký webhook" desc="Dùng để kiểm header x-veo-signature của mọi webhook gửi tới bạn. Giữ bí mật như mật khẩu.">
            {query.isLoading ? (
                <Skeleton className="h-11 rounded-xl" />
            ) : query.isError || !query.data ? (
                <p role="alert" className="text-sm text-app-danger">{getErrorMessage(query.error)}</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-app-border bg-app-bg px-3 py-2">
                        <input
                            readOnly
                            value={revealed ? query.data.secret : mask(query.data.secret)}
                            aria-label={revealed ? "Khoá ký webhook" : "Khoá ký webhook (đang ẩn)"}
                            onFocus={(e) => revealed && e.currentTarget.select()}
                            className="min-w-0 flex-1 truncate bg-transparent font-mono text-[13px] text-app-text outline-none"
                        />
                        <button type="button" onClick={() => setRevealed((v) => !v)} aria-pressed={revealed} aria-label={revealed ? "Ẩn khoá" : "Hiện khoá"} className="rounded-lg p-1.5 text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
                            {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                        </button>
                        <CopyButton value={query.data.secret} label="Sao chép khoá" className="[&>span]:sr-only" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-app-text-secondary">Tạo ngày {formatDate(query.data.createdAt)}</p>
                        <Button variant="secondary" size="sm" onClick={() => void onRotate()} disabled={rotate.isPending}>
                            <RefreshCw className={`h-3.5 w-3.5 ${rotate.isPending ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden /> Xoay khoá
                        </Button>
                    </div>
                </div>
            )}
        </Panel>
    );
}
