import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import { API_DOCS_URL, trialCtaLabel } from "../landingCopy";

const NAV = [
    { label: "Sản phẩm", id: "san-pham" },
    { label: "Cách dùng", id: "cach-hoat-dong" },
    { label: "Bảng giá", id: "bang-gia" },
    { label: "API", id: "api" },
];

function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomeHeader() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const signupGrant = usePricing().data?.signupGrant;
    const [open, setOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    // Drawer mobile: Esc đóng, Tab quay vòng trong drawer, đóng thì trả focus về nút mở
    useEffect(() => {
        if (!open) return;
        const first = drawerRef.current?.querySelector<HTMLElement>("button, a");
        first?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                toggleRef.current?.focus();
                return;
            }
            if (e.key !== "Tab" || !drawerRef.current) return;
            const items = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("button, a"));
            const firstItem = items[0];
            const lastItem = items.at(-1);
            if (!firstItem || !lastItem) return;
            if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
            else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const go = (path: string) => { setOpen(false); navigate(path); };
    const jump = (id: string) => { setOpen(false); scrollTo(id); };

    return (
        <header className="sticky top-0 z-50 border-b border-app-border/70 bg-app-bg/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="VideoGen AI - Về đầu trang"
                    className="group flex items-center gap-2.5"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-app-accent shadow-md shadow-app-accent/20 transition-transform group-hover:scale-105">
                        <Sparkles className="h-[18px] w-[18px] text-white" aria-hidden />
                    </span>
                    <span className="display-md text-base text-app-text">
                        VideoGen <span className="text-app-accent">AI</span>
                    </span>
                </button>

                <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 lg:flex">
                    {NAV.map((n) => (
                        <button
                            key={n.id}
                            type="button"
                            onClick={() => scrollTo(n.id)}
                            className="relative py-2 text-sm font-medium text-app-text-secondary transition-colors duration-200 hover:text-app-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 rounded"
                        >
                            {n.label}
                        </button>
                    ))}
                    <Link to={API_DOCS_URL}
                        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-app-text-secondary transition-colors hover:text-app-accent"
                    >
                        Tài liệu API
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                </nav>

                <div className="hidden items-center gap-2 sm:flex">
                    {user ? (
                        <button type="button" onClick={() => navigate("/dashboard")} className="rounded-lg bg-app-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-accent-hover">
                            Vào Dashboard
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => navigate("/login")} className="rounded-lg px-3.5 py-2 text-sm font-medium text-app-text-secondary transition-colors hover:text-app-accent">
                                Đăng nhập
                            </button>
                            <button type="button" onClick={() => navigate("/register")} className="rounded-lg bg-app-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-app-accent/20 transition-all hover:bg-app-accent-hover hover:shadow-md">
                                {trialCtaLabel(signupGrant)}
                            </button>
                        </>
                    )}
                </div>

                <button
                    ref={toggleRef}
                    type="button"
                    aria-label={open ? "Đóng menu" : "Mở menu"}
                    aria-expanded={open}
                    aria-controls="home-drawer"
                    onClick={() => setOpen((p) => !p)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border text-app-text-secondary transition hover:bg-app-surface-soft sm:hidden"
                >
                    {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
                </button>
            </div>

            {open && (
                <div id="home-drawer" ref={drawerRef} className="border-t border-app-border/70 bg-app-bg px-4 py-5 shadow-lg sm:hidden">
                    <div className="flex flex-col gap-1">
                        {NAV.map((n) => (
                            <button key={n.id} type="button" onClick={() => jump(n.id)} className="rounded-lg px-4 py-3 text-left text-sm text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text">
                                {n.label}
                            </button>
                        ))}
                        <Link to={API_DOCS_URL} className="rounded-lg px-4 py-3 text-left text-sm text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text">
                            Tài liệu API
                        </Link>
                        <div className="my-3 h-px bg-app-border" />
                        {user ? (
                            <button type="button" onClick={() => go("/dashboard")} className="rounded-lg bg-app-accent px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-app-accent-hover">
                                Vào Dashboard
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={() => go("/register")} className="rounded-lg bg-app-accent px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-app-accent-hover">
                                    {trialCtaLabel(signupGrant)}
                                </button>
                                <button type="button" onClick={() => go("/login")} className="mt-1 rounded-lg border border-app-border bg-app-surface px-4 py-3 text-left text-sm font-medium text-app-text transition hover:bg-app-surface-soft">
                                    Đăng nhập
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
