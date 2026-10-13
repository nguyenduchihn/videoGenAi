import { FolderKanban, Home, Sparkles, Settings, HelpCircle, X, PanelLeftOpen, PanelLeftClose, CreditCard, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { authService } from "@/services/auth.service";
import type { PortalMeResponse } from "@/types/api";
import { useAppearanceStore } from "@/stores/appearance.store";

import Upgrade from "../pricing/upgradeModal";
import UserMenu from "./userMenu";
interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const mainMenu = [
    {
        label: "Trang chủ",
        path: "/dashboard",
        icon: Home,
    },
    {
        label: "Dự án",
        path: "/projects",
        icon: FolderKanban,
    },
    {
        label: "Các gói dịch vụ",
        path: "/pricing",
        icon: CreditCard,
    },
];

const otherMenu = [
    {
        label: "Cài đặt",
        path: "/settings/appearance",
        icon: Settings,
    },
    {
        label: "Hỗ trợ",
        path: "/support",
        icon: HelpCircle,
    },
];

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const compactSidebar = useAppearanceStore(
        (state) => state.compactSidebar
    );

    const setCompactSidebar = useAppearanceStore(
        (state) => state.setCompactSidebar
    );

    const [isDesktop, setIsDesktop] = useState(() => {
        return (
            typeof window !== "undefined" &&
            window.matchMedia("(min-width: 1024px)").matches
        );
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleChange = (event: MediaQueryListEvent) => {
            setIsDesktop(event.matches);
        };

        setIsDesktop(mediaQuery.matches);
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    const isCompact = isDesktop && compactSidebar;

    const desktopCompact = compactSidebar;

    const [upgradeOpen, setUpgradeOpen] =
        useState(false);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [account, setAccount] = useState<PortalMeResponse | null>(null);

    useEffect(() => {
        let active = true;

        authService
            .me()
            .then((data) => {
                if (active) {
                    setAccount(data);
                }
            })
            .catch((error) => {
                console.error("Không thể tải thông tin tài khoản:", error);
            });

        return () => {
            active = false;
        };
    }, []);

    const userName = account?.user?.name || "Người dùng";

    const planName =
        account?.plan?.name ||
        (account?.user?.planId
            ? account.user.planId.charAt(0).toUpperCase() +
            account.user.planId.slice(1)
            : "Chưa có gói");

    const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
    const handleUpgradeOpen = () => {
        setUpgradeOpen(true);
    };

    const handleUpgradeClose = () => {
        setUpgradeOpen(false);
    };

    const handleNavClick = (path: string) => {
        onClose();

        if (
            window.matchMedia("(min-width: 1024px)").matches &&
            path === "/projects"
        ) {
            setCompactSidebar(true);
        }
    };
    return (
        <>
            <aside
                className={`
                    fixed 
                    inset-y-0 
                    left-0 
                    z-50 
                    flex 
                    h-screen 
                    min-h-0 
                    flex-col
                    overflow-hidden 
                    border-r 
                    border-[var(--app-border)]
                    bg-[var(--app-surface)] 
                    transition-all duration-200 ease-out
                    w-[280px]
                    ${desktopCompact ? "lg:w-[84px]" : "lg:w-[230px]"}
                    lg:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    `}
            >
                <div
                    className={`group relative flex h-16 shrink-0 items-center border-b border-[var(--app-border)] ${isCompact
                        ? "justify-center px-2"
                        : "justify-between px-4 lg:px-5"

                        }`}
                >
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className={`flex min-w-0 items-center ${isCompact ? "justify-center" : "gap-2.5"
                            }`}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>

                        {!isCompact && (
                            <span className="truncate text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                                VideoGen{" "}
                                <span className="text-[var(--app-accent)]">AI</span>
                            </span>
                        )}
                    </NavLink>
                    <button
                        type="button"
                        onClick={() => setCompactSidebar(!compactSidebar)}
                        aria-label={
                            compactSidebar
                                ? "Mở rộng thanh bên"
                                : "Thu gọn thanh bên"
                        }
                        title={
                            compactSidebar
                                ? "Mở rộng thanh bên"
                                : "Thu gọn thanh bên"
                        }
                        className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-accent)] lg:flex ${compactSidebar
                            ? "absolute inset-0 m-auto bg-[var(--app-surface)] opacity-0 group-hover:opacity-100"
                            : ""
                            }`}
                    >
                        {compactSidebar ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] lg:hidden"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
                    <div>
                        {!isCompact && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Workspace
                            </p>
                        )}

                        <div className="space-y-1">
                            {mainMenu.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => handleNavClick(item.path)}
                                        title={
                                            isCompact
                                                ? item.label
                                                : undefined
                                        }
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${isCompact
                                                ? "justify-center px-0"
                                                : "gap-3 px-3"
                                            } ${isActive
                                                ? "bg-[var(--app-accent-soft)] font-medium text-[var(--app-accent)]"
                                                : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    className={`h-[18px] w-[18px] shrink-0 ${isActive
                                                        ? "text-[var(--app-accent)]"
                                                        : "text-[var(--app-text-muted)]"
                                                        }`}
                                                />

                                                {!isCompact && (
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-2">
                        {!isCompact && (
                            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                Khác
                            </p>
                        )}

                        <div className="space-y-1">
                            {otherMenu.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => handleNavClick(item.path)}
                                        title={
                                            isCompact
                                                ? item.label
                                                : undefined
                                        }
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${isCompact
                                                ? "justify-center px-0"
                                                : "gap-3 px-3"
                                            } ${isActive
                                                ? "bg-[var(--app-accent-soft)] font-medium text-[var(--app-accent)]"
                                                : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    className={`h-[18px] w-[18px] shrink-0 ${isActive
                                                        ? "text-[var(--app-accent)]"
                                                        : "text-[var(--app-text-muted)]"
                                                        }`}
                                                />

                                                {!isCompact && (
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="min-h-0 shrink-0">
                    {isCompact ? (
                        <button
                            type="button"
                            onClick={handleUpgradeOpen}
                            title="Các gói nâng cấp"
                            className="flex h-10 w-full items-center justify-center rounded-lg bg-[var(--app-accent-soft)] transition hover:opacity-80"
                        >
                            <Sparkles className="h-4 w-4 text-[var(--app-accent)]" />
                        </button>
                    ) : (
                        <div className="rounded-xl bg-[var(--app-surface-soft)] p-3">
                            <div className="flex items-start gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)]">
                                    <Sparkles className="h-4 w-4 text-[var(--app-accent)]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[var(--app-text)]">
                                        Gói Pro
                                    </p>
                                    <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-text-secondary)]">
                                        Nâng cấp để tạo nhiều video hơn
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleUpgradeOpen}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-surface)] px-3 py-2.5 text-xs font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)] transition hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
                            >
                                <Sparkles className="h-4 w-4 text-[var(--app-accent)]" />
                                <span>Các gói nâng cấp</span>
                            </button>
                        </div>
                    )}

                    <div
                        className={`shrink-0 border-t border-[var(--app-border)] ${isCompact ? "p-2" : "p-3"
                            }`}
                    >
                        <div className="flex min-h-0 flex-col">
                            {userMenuOpen && !isCompact && (
                                <div className="mb-2 max-h-[40vh] min-w-0 shrink overflow-y-auto overscroll-contain">
                                    <UserMenu onClose={() => setUserMenuOpen(false)} />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                title={isCompact ? "Tài khoản" : undefined}
                                className={`flex w-full shrink-0 items-center rounded-xl py-2 transition hover:bg-[var(--app-surface-soft)] ${isCompact ? "justify-center px-0" : "gap-3 px-2"
                                    }`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-xs font-semibold text-white">
                                    {userInitial}
                                </div>

                                {!isCompact && (
                                    <>
                                        <div className="min-w-0 flex-1 text-left">
                                            <p className="truncate text-xs font-semibold text-[var(--app-text)]">
                                                {userName}
                                            </p>

                                            <p className="truncate text-[10px] text-[var(--app-text-secondary)]">
                                                {planName}
                                            </p>
                                        </div>

                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-[var(--app-text-secondary)] transition-transform ${userMenuOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <Upgrade
                open={upgradeOpen}
                onClose={handleUpgradeClose}
            />
        </>
    );
}