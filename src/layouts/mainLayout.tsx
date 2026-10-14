import { useEffect, useState } from "react";
import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { OverlayLoader } from "@/components/feedback/OverlayLoader";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sideBar";
import { useMe } from "@/hooks/useMe";
import { useAppearanceStore } from "@/stores/appearance.store";
import { useAuthStore } from "@/stores/auth.store";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const compactSidebar = useAppearanceStore(
        (state) => state.compactSidebar
    );

    const setCompactSidebar = useAppearanceStore(
        (state) => state.setCompactSidebar
    );

    const user = useAuthStore((state) => state.user);
    const clearUser = useAuthStore((state) => state.clearUser);

    const location = useLocation();
    const navigate = useNavigate();

    // Mọi trang trong MainLayout đều cần phiên: /portal/auth/me qua TanStack Query (Dashboard, Profile… dùng chung cache).
    const meQuery = useMe();
    const checkingSession = !user && (meQuery.isPending || meQuery.isError);

    useEffect(() => {
        if (location.pathname.startsWith("/projects")) {
            setCompactSidebar(true);
        }
    }, [location.pathname, setCompactSidebar]);

    useEffect(() => {
        if (!meQuery.isError) return;
        clearUser();
        navigate("/login", { replace: true, state: { from: location.pathname } });
        // Chỉ phản ứng khi query chuyển sang lỗi (401 hoặc mạng).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meQuery.isError]);

    if (checkingSession) {
        return (
            <div className="min-h-dvh bg-[var(--app-bg)]">
                <OverlayLoader message="Đang kiểm tra phiên đăng nhập…" blocking />
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-[var(--app-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--app-text)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
            >
                Bỏ qua điều hướng
            </a>
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
                className={`min-h-dvh transition-[margin] duration-200 ${compactSidebar
                    ? "lg:ml-[84px]"
                    : "lg:ml-[230px]"
                    }`}
            >
                <Header
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main id="main-content" className="min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
