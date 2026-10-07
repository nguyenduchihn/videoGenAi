import {
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
    onClose: () => void;
}

export default function UserMenu({
    onClose,
}: UserMenuProps) {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    const handleLogout = () => {
        onClose();
        navigate("/login");
    };

    return (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl shadow-black/10 transition-colors">
            <div className="border-b border-[var(--app-border)] px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-sm font-semibold text-white">
                        C
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                            Chính
                        </p>

                        <p className="truncate text-xs text-[var(--app-text-secondary)]">
                            Tài khoản Pro
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
                        handleNavigate("/pricing")
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <CreditCard className="h-4 w-4 shrink-0 text-[var(--app-text-muted)]" />
                    Gói của tôi
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleNavigate("/settings")
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}