import { Lock, ShieldCheck } from "lucide-react";

export default function Security() {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[var(--app-text)]">
                    Bảo mật
                </h2>

                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                    Quản lý các thiết lập bảo mật cho tài khoản của bạn.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div className="flex items-center gap-3 border-b border-[var(--app-border)] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]">
                        <Lock className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-[var(--app-text)]">
                            Mật khẩu
                        </h3>

                        <p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">
                            Thay đổi mật khẩu đăng nhập của bạn.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--app-text)]">
                            Đổi mật khẩu
                        </p>

                        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                            Tính năng đổi mật khẩu sẽ được cập nhật trong phiên
                            bản tiếp theo.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled
                        className="w-full shrink-0 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--app-text-muted)] sm:w-auto"
                    >
                        Đổi mật khẩu
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                        <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-[var(--app-text)]">
                            Bảo mật tài khoản
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
                            API Keys được quản lý riêng tại mục API Keys.
                            Đăng xuất tài khoản được thực hiện từ menu tài
                            khoản.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}