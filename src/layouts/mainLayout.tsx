import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sideBar";
import { useAppearanceStore } from "@/stores/appearance.store";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const compactSidebar =
        useAppearanceStore(
            (state) => state.compactSidebar
        );

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <Sidebar
                open={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />

            <div
                className={`min-h-screen transition-[margin] duration-200 ${compactSidebar
                    ? "lg:ml-[84px]"
                    : "lg:ml-[230px]"
                    }`}
            >
                <Header
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}