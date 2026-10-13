
import {
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import type { PortalMeResponse } from "@/types/api";
import { useAuthStore } from "@/stores/auth.store";

interface UserMenuProps {
    onClose: () => void;
}

export default function UserMenu({
    onClose,
}: UserMenuProps) {
    const navigate = useNavigate();

    const [account, setAccount] =
        useState<PortalMeResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadAccount = async () => {
            try {
                const data = await authService.me();

                if (active) {
                    setAccount(data);
                }
            } catch {
                if (active) {
                    setError("Không thể tải thông tin tài khoản.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadAccount();

        return () => {
            active = false;
        };
    }, []);

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        setError("");

        try {
            await authService.logout();
        } catch (error) {
            console.error("Đăng xuất API thất bại:", error);
        } finally {
            useAuthStore.getState().clearUser();

            onClose();
            navigate("/login", { replace: true });

            setLoggingOut(false);
        }
    };

    const user = account?.user;
    const planName =
        account?.plan?.name ||
        (user?.planId
            ? user.planId.charAt(0).toUpperCase() +
            user.planId.slice(1)
            : "Chưa có gói");

    const initial =
        user?.name?.trim().charAt(0).toUpperCase() || "U";

    return (
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
            <div className="border-b border-[var(--app-border)] px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-sm font-semibold text-white">
                        {loading ? "…" : initial}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                            {loading
                                ? "Đang tải..."
                                : user?.name || "Người dùng"}
                        </p>

                        <p className="truncate text-xs text-[var(--app-text-secondary)]">
                            {user?.email || ""}
                        </p>

                        {!loading && user && (
                            <p className="mt-1 truncate text-xs text-[var(--app-text-muted)]">
                                Gói {planName}
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mt-2 text-xs text-red-600"
                    >
                        {error}
                    </p>
                )}
            </div>

            <div className="p-1.5">
                <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <User className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    Hồ sơ
                </button>

                <button
                    type="button"
                    onClick={() => handleNavigate("/pricing")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <CreditCard className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    Gói của tôi
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
