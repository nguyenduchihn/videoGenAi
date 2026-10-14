import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const NAV = [
    { label: "Sản phẩm", id: "san-pham" },
    { label: "Cách hoạt động", id: "cach-hoat-dong" },
    { label: "Ứng dụng", id: "ung-dung" },
    { label: "Bảng giá", id: "bang-gia" },
];

function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomeHeader() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-app-border/40 bg-app-bg/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-2.5"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent shadow-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                    </span>
                    <span className="text-base font-semibold tracking-tight text-app-text">
                        VideoGen <span className="text-app-accent">AI</span>
                    </span>
                </button>

                <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 lg:flex">
                    {NAV.map((n) => (
                        <button
                            key={n.id}
                            type="button"
                            onClick={() => scrollTo(n.id)}
                            className="text-sm text-app-text-secondary transition hover:text-app-text"
                        >
                            {n.label}
                        </button>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 sm:flex">
                    {user ? (
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="rounded-lg bg-app-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-accent-hover"
                        >
                            Vào Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="px-3 py-2 text-sm font-medium text-app-text-secondary transition hover:text-app-text"
                            >
                                Đăng nhập
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="rounded-lg border border-app-border bg-app-surface px-3.5 py-2 text-sm font-medium text-app-text transition hover:bg-app-surface-soft"
                            >
                                Đăng ký
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    aria-label={open ? "Đóng menu" : "Mở menu"}
                    aria-expanded={open}
                    onClick={() => setOpen((p) => !p)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border text-app-text-secondary transition hover:bg-app-surface-soft sm:hidden"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {open && (
                <div className="border-t border-app-border/40 bg-app-bg px-4 py-5 sm:hidden">
                    <div className="flex flex-col gap-1">
                        {NAV.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => { setOpen(false); scrollTo(n.id); }}
                                className="rounded-lg px-4 py-3 text-left text-sm text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text"
                            >
                                {n.label}
                            </button>
                        ))}
                        <div className="my-3 h-px bg-app-border" />
                        {user ? (
                            <button
                                type="button"
                                onClick={() => { setOpen(false); navigate("/dashboard"); }}
                                className="rounded-lg bg-app-accent px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-app-accent-hover"
                            >
                                Vào Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => { setOpen(false); navigate("/login"); }}
                                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-app-text-secondary transition hover:bg-app-surface-soft hover:text-app-text"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setOpen(false); navigate("/register"); }}
                                    className="mt-1 rounded-lg border border-app-border bg-app-surface px-4 py-3 text-left text-sm font-medium text-app-text transition hover:bg-app-surface-soft"
                                >
                                    Đăng ký
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
