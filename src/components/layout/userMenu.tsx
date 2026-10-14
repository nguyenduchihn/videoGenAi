import {
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

interface UserMenuProps {
    onClose: () => void;
}

export default function UserMenu({
    onClose,
}: UserMenuProps) {
    const navigate = useNavigate();

    const me = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);

    const [loggingOut, setLoggingOut] = useState(false);

    const displayName =
        me?.user.name?.trim() || me?.user.email || "Tài khoản";

    const planLabel = `Nạp credits · ${me?.balance.display ?? '—'}`;

    const initial = displayName.charAt(0).toUpperCase();

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    const handleLogout = async () => {
        if (loggingOut) {
            return;
        }

        try {
            setLoggingOut(true);
            await authService.logout();
        } catch {
            // Cookie có thể đã hết hạn: vẫn xoá phiên phía client và về trang đăng nhập.
        } finally {
            clearUser();
            onClose();
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
            <div className="border-b border-[var(--app-border)] px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-sm font-semibold text-white">
                        {initial}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                            {displayName}
                        </p>

                        <p className="truncate text-xs text-[var(--app-text-secondary)]">
                            {me?.user.email ?? planLabel}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-1.5">
                <button
                    type="button"
                    onClick={() =>
                        handleNavigate("/profile")
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <User className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    Hồ sơ
                </button>

                <button
                    type="button"
                    onClick={() =>
        handleNavigate("/billing")
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <CreditCard className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    {planLabel}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleNavigate("/settings/appearance")
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <Settings className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    Cài đặt
                </button>
            </div>

            <div className="border-t border-[var(--app-border)] p-1.5">
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
            </div>
        </div>
    );
}
