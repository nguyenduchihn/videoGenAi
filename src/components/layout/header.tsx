import {
    ChevronDown,
    Menu,
} from "lucide-react";
import { useState } from "react";
import UserMenu from "./userMenu";



interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({
    onMenuClick,
}: HeaderProps) {
    const [userMenuOpen, setUserMenuOpen] =
        useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
                    aria-label="Mở menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>


            <div className="flex items-center gap-1 sm:gap-2">

                <div className="relative ml-1 sm:ml-2">
                    <button
                        type="button"
                        onClick={() =>
                            setUserMenuOpen(
                                (prev) => !prev
                            )
                        }
                        className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-gray-100 sm:px-2"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white">
                            K
                        </div>


                        <div className="hidden text-left sm:block">
                            <p className="max-w-[100px] truncate text-xs font-semibold text-gray-900">
                                Kull Chính
                            </p>

                            <p className="text-[10px] text-gray-500">
                                Free
                            </p>
                        </div>

                        <ChevronDown
                            className={`hidden h-4 w-4 text-gray-400 transition sm:block ${userMenuOpen
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                    {userMenuOpen && (
                        <UserMenu
                            onClose={() =>
                                setUserMenuOpen(
                                    false
                                )
                            }
                        />
                    )}
                </div>
            </div>
        </header>
    );
}