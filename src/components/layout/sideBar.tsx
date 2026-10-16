import { ChevronDown, CreditCard, HelpCircle, History, Home, Image, Layers, PanelLeftClose, PanelLeftOpen, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAppearanceStore } from "@/stores/appearance.store";
import { useAuthStore } from "@/stores/auth.store";

import UserMenu from "./userMenu";
interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const mainMenu = [
    { label: "Trang chủ", path: "/dashboard", icon: Home },
    { label: "Lượt tạo", path: "/runs", icon: Layers }, // thay "Dự án" (/projects chuyển hướng về đây)
    { label: "Thư viện", path: "/library", icon: Image },
    { label: "Lịch sử tác vụ", path: "/tasks", icon: History },
    { label: "Nạp credits", path: "/billing", icon: CreditCard },
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

    const compactSidebar = useAppearanceStore((s) => s.compactSidebar);
    const setCompactSidebar = useAppearanceStore((s) => s.setCompactSidebar);

    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navigate = useNavigate();
    const me = useAuthStore((state) => state.user);

    const displayName =
        me?.user.name?.trim() || me?.user.email || "Tài khoản";

    const planName = me?.plan?.name ?? "Miễn phí";

    const initial = displayName.charAt(0).toUpperCase();
    const handleNavClick = () => {
        onClose();
    };
    return (
        <>
            <aside
                aria-label="Điều hướng chính"
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
                    transition-all duration-200 
                    ease-out
                    w-[280px]
                    ${compactSidebar ? "lg:w-[84px]" : "lg:w-[230px]"}
                    lg:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    `}
            >
                <div
                    className={`group relative flex h-16 shrink-0 items-center border-b border-[var(--app-border)] ${compactSidebar
                        ? "justify-between px-4 lg:justify-center lg:px-2"
                        : "justify-between px-4 lg:px-5"
                        }`}
                >
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className={`flex min-w-0 items-center ${compactSidebar
                            ? "gap-2.5 lg:justify-center lg:gap-0"
                            : "gap-2.5"
                            }`}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>

                        <span
                            className={`truncate text-[15px] font-semibold tracking-tight text-[var(--app-text)] ${compactSidebar ? "lg:hidden" : ""
                                }`}
                        >
                            VideoGen <span className="text-[var(--app-accent)]">AI</span>
                        </span>
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
                                        aria-label={compactSidebar ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${compactSidebar
                                                ? "justify-start gap-3 px-3 lg:justify-center lg:gap-0 lg:px-0"
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

                                                <span className={compactSidebar ? "truncate lg:hidden" : "truncate"}>
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-2">
                        <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] ${compactSidebar ? "lg:hidden" : ""}`}>
                            Khác
                        </p>

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
                                        aria-label={compactSidebar ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `flex items-center rounded-lg py-2.5 text-sm transition ${compactSidebar
                                                ? "justify-start gap-3 px-3 lg:justify-center lg:gap-0 lg:px-0"
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

                                                <span className={compactSidebar ? "lg:hidden" : ""}>
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div
                    className={`min-h-0 shrink-0 ${compactSidebar ? "px-3 pt-3 lg:px-2 lg:pt-2" : "px-3 pt-3"
                        }`}
                >
                    {/* Credits: đầy đủ trên mobile, chỉ icon trên desktop compact */}
                    <div className={compactSidebar ? "lg:hidden" : ""}>
                        <div className="rounded-xl bg-[var(--app-surface-soft)] p-3">
                            <div className="flex items-start gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)]">
                                    <CreditCard className="h-4 w-4 text-[var(--app-accent)]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[var(--app-text)]">
                                        {planName}
                                    </p>
                                    <p className="mt-0.5 text-[10px] leading-4 text-[var(--app-text-secondary)]">
                                        {me?.balance.display ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate("/billing");
                                }}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-surface)] px-3 py-2.5 text-xs font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)] transition hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
                            >
                                <CreditCard className="h-4 w-4 text-[var(--app-accent)]" />
                                <span>Nạp credits</span>
                            </button>
                        </div>
                    </div>

                    {compactSidebar && (
                        <button
                            type="button"
                            onClick={() => navigate("/billing")}
                            title="Nạp credits"
                            aria-label="Nạp credits"
                            className="hidden h-10 w-full items-center justify-center rounded-lg bg-[var(--app-accent-soft)] transition hover:opacity-80 lg:flex"
                        >
                            <CreditCard className="h-4 w-4 text-[var(--app-accent)]" />
                        </button>
                    )}

                    {/* Tài khoản */}
                    <div
                        className={`mt-3 shrink-0 border-t border-[var(--app-border)] ${compactSidebar ? "-mx-2 p-2" : "-mx-3 p-3"
                            }`}
                    >
                        <div className="flex min-h-0 flex-col">
                            {userMenuOpen && (
                                <div
                                    className={`mb-2 max-h-[40vh] min-w-0 shrink overflow-y-auto overscroll-contain ${compactSidebar ? "lg:hidden" : ""
                                        }`}
                                >
                                    <UserMenu onClose={() => setUserMenuOpen(false)} />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setUserMenuOpen((prev) => !prev)}
                                title={compactSidebar ? "Tài khoản" : undefined}
                                aria-label="Tài khoản"
                                aria-expanded={userMenuOpen}
                                className={`flex w-full shrink-0 items-center rounded-xl py-2 transition hover:bg-[var(--app-surface-soft)] ${compactSidebar
                                    ? "justify-start gap-3 px-2 lg:justify-center lg:px-0"
                                    : "gap-3 px-2"
                                    }`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-xs font-semibold text-white">
                                    {initial}
                                </div>

                                <div
                                    className={`min-w-0 flex-1 text-left ${compactSidebar ? "lg:hidden" : ""
                                        }`}
                                >
                                    <p className="truncate text-xs font-semibold text-[var(--app-text)]">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-[10px] text-[var(--app-text-secondary)]">
                                        {planName}
                                    </p>
                                </div>

                                <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-[var(--app-text-secondary)] transition-transform ${userMenuOpen ? "rotate-180" : ""
                                        } ${compactSidebar ? "lg:hidden" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </aside >

        </>
    );
}