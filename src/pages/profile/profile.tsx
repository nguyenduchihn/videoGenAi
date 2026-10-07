import {
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Mail,
    ShieldCheck,
    User,
} from "lucide-react";

import Button from "@/components/common/button";

export default function Profile() {
    return (
        <div className="min-h-full bg-[var(--app-bg)] transition-colors">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--app-text)]">
                        Hồ sơ
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                        Quản lý thông tin cá nhân và thông tin tài khoản
                        của bạn.
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-2xl font-semibold text-white">
                                    C
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg font-semibold text-[var(--app-text)]">
                                        Chính
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                                        chinhkull18@gmail.com
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--app-accent)]">
                                            Pro
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Đã xác minh
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                        <div className="border-b border-[var(--app-border)] px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                                    <User className="h-4 w-4" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[var(--app-text)]">
                                        Thông tin cá nhân
                                    </h3>

                                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                                        Thông tin cơ bản của tài khoản.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Họ và tên
                                </p>

                                <p className="mt-1 text-sm font-medium text-[var(--app-text)]">
                                    Kull Chính
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Email
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-[var(--app-text-muted)]" />

                                    <p className="text-sm font-medium text-[var(--app-text)]">
                                        chinhkull18@gmail.com
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Trạng thái tài khoản
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                    <p className="text-sm font-medium text-[var(--app-text)]">
                                        Đang hoạt động
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Ngày tham gia
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[var(--app-text-muted)]" />

                                    <p className="text-sm font-medium text-[var(--app-text)]">
                                        2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                        <div className="border-b border-[var(--app-border)] px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <CreditCard className="h-4 w-4" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[var(--app-text)]">
                                        Gói hiện tại
                                    </h3>

                                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                                        Thông tin gói và credits của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-3">
                            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Gói
                                </p>

                                <p className="mt-1 text-base font-semibold text-[var(--app-text)]">
                                    Pro
                                </p>
                            </div>

                            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Credits
                                </p>

                                <p className="mt-1 text-base font-semibold text-[var(--app-text)]">
                                    0
                                </p>
                            </div>

                            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                <p className="text-xs text-[var(--app-text-muted)]">
                                    Trạng thái
                                </p>

                                <p className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                    Đang hoạt động
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                        <div className="flex items-center gap-4 p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--app-text)]">
                                    Bảo mật tài khoản
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">
                                    Quản lý mật khẩu và các phiên đăng nhập
                                    trong phần Bảo mật.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    window.location.href =
                                        "/settings/security";
                                }}
                            >
                                Quản lý
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}