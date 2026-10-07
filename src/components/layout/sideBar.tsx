import {
    FolderKanban,
    Home,
    Sparkles,
    Settings,
    HelpCircle,
    X,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
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
        path: "/settings",
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
                    w-[280px]
                    flex-col
                    border-r
                    border-gray-200
                    bg-white
                    transition-transform
                    duration-200
                    ease-out
                    lg:w-[230px]
                    lg:translate-x-0
                    ${open
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4 lg:px-5">
                    <NavLink
                        to="/dashboard"
                        onClick={handleNavClick}
                        className="flex min-w-0 items-center gap-2.5"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>

                        <span className="truncate text-[15px] font-semibold tracking-tight text-gray-900">
                            VideoGen{" "}
                            <span className="text-violet-600">
                                AI
                            </span>
                        </span>
                    </NavLink>


                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

                    <div>
                        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Workspace
                        </p>

                        <div className="space-y-1">
                            {mainMenu.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={
                                            handleNavClick
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive
                                                ? "bg-violet-50 font-medium text-violet-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        {({
                                            isActive,
                                        }) => (
                                            <>
                                                <Icon
                                                    className={`h-[18px] w-[18px] shrink-0 ${isActive
                                                        ? "text-violet-600"
                                                        : "text-gray-400"
                                                        }`}
                                                />

                                                <span className="truncate">
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>


                    <div className="mt-7">
                        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Khác
                        </p>

                        <div className="space-y-1">
                            {otherMenu.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={
                                            handleNavClick
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive
                                                ? "bg-violet-50 font-medium text-violet-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        {({
                                            isActive,
                                        }) => (
                                            <>
                                                <Icon
                                                    className={`h-[18px] w-[18px] shrink-0 ${isActive
                                                        ? "text-violet-600"
                                                        : "text-gray-400"
                                                        }`}
                                                />

                                                <span className="truncate">
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="shrink-0 border-t border-gray-100 p-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                        <div className="flex items-start gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                                <Sparkles className="h-4 w-4 text-violet-600" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900">
                                    Gói Free
                                </p>

                                <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                                    Nâng cấp để tạo
                                    nhiều video hơn
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleUpgradeOpen
                            }
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            <Sparkles className="h-4 w-4 text-violet-500" />

                            <span>
                                Các gói nâng cấp
                            </span>
                        </button>
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