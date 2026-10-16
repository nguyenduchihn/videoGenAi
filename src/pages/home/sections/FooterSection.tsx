import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

interface FooterColProps {
    title: string;
    items: FooterLink[];
}

function FooterCol({ title, items }: FooterColProps) {
    return (
        <div>
            <h4 className="text-sm font-semibold text-app-text">
                {title}
            </h4>

            <ul className="mt-4 space-y-3">
                {items.map((item) => (
                    <li key={item.label}>
                        {item.external ? (
                            <a
                                href={item.href}
                                className="group inline-flex items-center gap-1 text-sm text-app-text-muted transition-colors hover:text-app-accent"
                            >
                                {item.label}
                                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                        ) : (
                            <Link
                                to={item.href}
                                className="group inline-flex items-center gap-1 text-sm text-app-text-muted transition-colors hover:text-app-accent"
                            >
                                {item.label}
                                {item.href.startsWith("#") && (
                                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                )}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const FOOTER_COLUMNS: { title: string; items: FooterLink[] }[] = [
    {
        title: "Sản phẩm",
        items: [
            { label: "AI Video Generator", href: "/dashboard" },
            { label: "Dự án", href: "/projects" },
            { label: "Phương tiện", href: "/dashboard" },
        ],
    },
    {
        title: "Khám phá",
        items: [
            { label: "Cách hoạt động", href: "/#cach-hoat-dong" },
            { label: "Ứng dụng", href: "/#ung-dung" },
            { label: "Bảng giá", href: "/pricing" },
        ],
    },
    {
        title: "Tài khoản",
        items: [
            { label: "Đăng nhập", href: "/login" },
            { label: "Đăng ký", href: "/register" },
        ],
    },
];

const YEAR = new Date().getFullYear();

export function FooterSection() {
    return (
        <footer className="border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_2fr] lg:gap-16 lg:py-16">
                    <div className="max-w-sm">
                        <Link
                            to="/"
                            aria-label="VideoGen AI - Trang chủ"
                            className="group inline-flex items-center gap-3"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent text-white shadow-lg shadow-app-accent/20 transition-transform duration-200 group-hover:scale-105">
                                <Sparkles className="h-5 w-5" />
                            </span>

                            <span className="text-base font-bold tracking-tight text-app-text">
                                VideoGen{" "}
                                <span className="text-app-accent">AI</span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-xs text-sm leading-7 text-app-text-secondary">
                            AI Creative Workspace giúp bạn biến ý tưởng thành
                            những video chuyên nghiệp — đơn giản, trực quan
                            và hiệu quả.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-bg px-3 py-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-xs font-medium text-app-text-secondary">
                                Your creative workspace
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-x-8">
                        {FOOTER_COLUMNS.map((column) => (
                            <FooterCol
                                key={column.title}
                                title={column.title}
                                items={column.items}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-app-border py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-app-text-muted">
                        © {YEAR} VideoGen AI. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link
                            to="/privacy"
                            className="text-xs text-app-text-muted transition-colors hover:text-app-accent"
                        >
                            Chính sách bảo mật
                        </Link>

                        <span
                            aria-hidden="true"
                            className="h-1 w-1 rounded-full bg-app-border"
                        />

                        <Link
                            to="/terms"
                            className="text-xs text-app-text-muted transition-colors hover:text-app-accent"
                        >
                            Điều khoản sử dụng
                        </Link>

                        <span
                            aria-hidden="true"
                            className="h-1 w-1 rounded-full bg-app-border"
                        />

                        <Link
                            to="/"
                            className="text-xs font-medium text-app-text-secondary transition-colors hover:text-app-accent"
                        >
                            Trang chủ ↑
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}