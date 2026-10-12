import {
    CalendarDays,
    Check,
    CreditCard,
    Sparkles,
    Zap,
} from "lucide-react";
import { useState } from "react";
import UpgradeModal from "@/components/pricing/upgradeModal";

import Button from "@/components/common/button";

const benefits = [
    "Truy cập các model AI tạo video",
    "Tạo hình ảnh bằng AI",
    "Hỗ trợ tạo nhiều job",
    "Ưu tiên xử lý cao hơn",
];

export default function MyPlan() {
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    return (
        <div className="min-h-full bg-[var(--app-bg)] transition-colors">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--app-text)]">
                        Gói của tôi
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                        Quản lý gói dịch vụ, credits và quyền lợi của bạn.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-[var(--app-accent)]/20 bg-[var(--app-surface)] transition-colors">
                        <div className="bg-[var(--app-accent-soft)]/60 p-5 sm:p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent)] text-white">
                                    <Sparkles className="h-6 w-6" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold text-[var(--app-text)]">
                                            Gói Pro
                                        </h2>

                                        <span className="rounded-full bg-[var(--app-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--app-accent)]">
                                            Đang sử dụng
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                                        Gói hiện tại của tài khoản.
                                    </p>
                                </div>

                                <Button onClick={() => setUpgradeOpen(true)}>
                                    Nâng cấp gói
                                </Button>
                            </div>
                        </div>

                        <div className="grid divide-y divide-[var(--app-border)] border-t border-[var(--app-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[var(--app-text-muted)]">
                                    <CreditCard className="h-4 w-4" />

                                    <span className="text-xs">
                                        Credits
                                    </span>
                                </div>

                                <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">
                                    0
                                </p>

                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                    Credits khả dụng
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[var(--app-text-muted)]">
                                    <CalendarDays className="h-4 w-4" />

                                    <span className="text-xs">
                                        Thời hạn
                                    </span>
                                </div>

                                <p className="mt-2 text-base font-semibold text-[var(--app-text)]">
                                    Không giới hạn
                                </p>

                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                    Theo gói hiện tại
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-2 text-[var(--app-text-muted)]">
                                    <Zap className="h-4 w-4" />

                                    <span className="text-xs">
                                        Trạng thái
                                    </span>
                                </div>

                                <p className="mt-2 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                    Đang hoạt động
                                </p>

                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                    Tài khoản hoạt động bình thường
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                        <div className="border-b border-[var(--app-border)] px-5 py-4">
                            <h3 className="text-sm font-semibold text-[var(--app-text)]">
                                Quyền lợi của gói
                            </h3>

                            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                Các tính năng hiện có trong gói của bạn.
                            </p>
                        </div>

                        <div className="grid gap-3 p-5 sm:grid-cols-2">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit}
                                    className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3 transition-colors"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Check className="h-4 w-4" />
                                    </div>

                                    <span className="text-sm text-[var(--app-text-secondary)]">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                    <UpgradeModal
                        open={upgradeOpen}
                        onClose={() => setUpgradeOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}