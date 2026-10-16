import { ArrowUpRight, Moon, Sparkles, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsDark } from "@/pages/home/useIsDark";
import { useAppearanceStore } from "@/stores/appearance.store";
import { useAuthStore } from "@/stores/auth.store";
import { REFERENCE_URL } from "../content/constants";

export function DocsHeader() {
    const loggedIn = useAuthStore((s) => s.user !== null);
    const isDark = useIsDark();
    const setTheme = useAppearanceStore((s) => s.setTheme);
    return (
        <header className="sticky top-0 z-30 h-14 border-b border-app-border bg-app-bg/85 backdrop-blur-md">
            <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4 lg:px-8">
                <Link to="/" className="group flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent" aria-label="VideoGen AI, về trang chủ">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent shadow-md shadow-app-accent/20 transition-transform group-hover:scale-105">
                        <Sparkles className="h-4 w-4 text-white" aria-hidden />
                    </span>
                    <span className="docs-display hidden text-[15px] font-bold text-app-text sm:inline">VideoGen <span className="text-app-accent">AI</span></span>
                </Link>
                <span className="text-app-border" aria-hidden>/</span>
                <span className="truncate text-sm font-medium text-app-text-secondary">Tài liệu API</span>
                <nav aria-label="Tài liệu" className="ml-auto flex items-center gap-1">
                    <a href={REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-app-text-secondary transition hover:text-app-text md:inline-flex">
                        Tham chiếu đầy đủ <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} className="rounded-lg p-2 text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
                        {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
                    </button>
                    <Link to={loggedIn ? "/settings/api-keys" : "/login"} state={loggedIn ? undefined : { from: "/api-docs" }} className="ml-1 rounded-lg bg-app-accent px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-app-accent/20 transition hover:bg-app-accent-hover">
                        {loggedIn ? <><span className="sr-only">Quản lý </span>API key</> : "Đăng nhập"}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
