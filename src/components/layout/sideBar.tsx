import { FolderKanban, Home, Sparkles, Settings, HelpCircle, X, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAppearanceStore } from "@/stores/appearance.store";

import Upgrade from "../pricing/upgrade";

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

    const [upgradeOpen, setUpgradeOpen] =
        useState(false);

    const handleUpgradeOpen = () => {
        setUpgradeOpen(true);
    };

    const handleUpgradeClose = () => {
        setUpgradeOpen(false);
    };

    const handleNavClick = () => {
        onClose();
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
                    flex-col
                    border-r
                    border-[var(--app-border)]
                    bg-[var(--app-surface)]
                    transition-all
                    duration-200
                    ease-out
                    w-[280px]
                    ${compactSidebar
                        ? "lg:w-[84px]"
                        : "lg:w-[230px]"
                    }
                    lg:translate-x-0
                    ${open
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                <div
                    className={`flex h-16 shrink-0 items-center border-b border-[var(--app-border)] ${compactSidebar
                        ? "justify-center px-2"
                        : "justify-between px-4 lg:px-5"
                        }`}
                >
                    <NavLink
                        to="/dashboard"
                        onClick={handleNavClick}
                        className={`flex min-w-0 items-center ${compactSidebar
                            ? "justify-center"
                            : "gap-2.5"
                            }`}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>

                        {!compactSidebar && (
                            <span className="truncate text-[15px] font-semibold tracking-tight text-[var(--app-text)]">
                                VideoGen{" "}
                                <span className="text-[var(--app-accent)]">
                                    AI
                                </span>
                            </span>
                        )}
                    </NavLink>
                    <button
                        type="button"
                        onClick={() => setCompactSidebar(!compactSidebar)}
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] lg:flex"
                        aria-label={
                            compactSidebar
                                ? "Mở rộng thanh bên"
                                : "Thu gọn thanh bên"
                        }
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
                        {!compactSidebar && (
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
                                        onClick={handleNavClick}
                                        title={
                                            compactSidebar
                                                ? item.label
                                                : undefined
                                        }
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${compactSidebar
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

                                                {!compactSidebar && (
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

                    <div className="mt-7">
                        {!compactSidebar && (
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
                                        onClick={handleNavClick}
                                        title={
                                            compactSidebar
                                                ? item.label
                                                : undefined
                                        }
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${compactSidebar
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

                                                {!compactSidebar && (
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

                <div
                    className={`shrink-0 border-t border-[var(--app-border)] ${compactSidebar
                        ? "p-2"
                        : "p-3"
                        }`}
                >
                    {compactSidebar ? (
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
                                        Nâng cấp để tạo
                                        nhiều video hơn
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleUpgradeOpen}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-surface)] px-3 py-2.5 text-xs font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)] transition hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
                            >
                                <Sparkles className="h-4 w-4 text-[var(--app-accent)]" />

                                <span>
                                    Các gói nâng cấp
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </aside >

            <Upgrade
                open={upgradeOpen}
                onClose={handleUpgradeClose}
            />
        </>
    );
}