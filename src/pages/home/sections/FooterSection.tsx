import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE } from "./apiSamples";
import { API_DOCS_URL } from "../landingCopy";

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
            <h4 className="text-sm font-semibold text-app-text">{title}</h4>
            <ul className="mt-4 space-y-3">
                {items.map((item) => (
                    <li key={item.label}>
                        {item.external ? (
                            <a href={item.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm text-app-text-muted transition-colors hover:text-app-accent">
                                {item.label}
                                <ArrowUpRight className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
                            </a>
                        ) : (
                            <Link to={item.href} className="text-sm text-app-text-muted transition-colors hover:text-app-accent">
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const FOOTER_COLUMNS: FooterColProps[] = [
    {
        title: "Sản phẩm",
        items: [
            { label: "Studio tạo video", href: "/dashboard" },
            { label: "Lượt tạo", href: "/runs" },
            { label: "Thư viện", href: "/library" },
            { label: "Bảng giá", href: "/pricing" },
        ],
    },
    {
        title: "Developer",
        items: [
            { label: "Tài liệu API", href: API_DOCS_URL, external: true },
            { label: "OpenAPI JSON", href: `${API_BASE}/docs/json`, external: true },
            { label: "API key", href: "/settings/api-keys" },
            { label: "Trạng thái API", href: `${API_BASE}/health/ready`, external: true },
        ],
    },
    {
        title: "Tài khoản",
        items: [
            { label: "Đăng nhập", href: "/login" },
            { label: "Đăng ký", href: "/register" },
            { label: "Hỗ trợ", href: "/support" },
        ],
    },
];

const YEAR = new Date().getFullYear();

export function FooterSection() {
    return (
        <footer className="border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_2fr] lg:gap-16 lg:py-16">
                    <div className="max-w-sm">
                        <Link to="/" aria-label="VideoGen AI - Trang chủ" className="group inline-flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent text-white shadow-lg shadow-app-accent/20 transition-transform duration-200 group-hover:scale-105">
                                <Sparkles className="h-5 w-5" aria-hidden />
                            </span>
                            <span className="display-md text-base text-app-text">
                                VideoGen <span className="text-app-accent">AI</span>
                            </span>
                        </Link>
                        <p className="mt-5 max-w-xs text-sm leading-7 text-app-text-secondary">
                            Tạo video và ảnh bằng Google Veo 3.1 qua Studio hoặc REST API. Thanh toán chuyển khoản, cộng credit tự động.
                        </p>
                        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-bg px-3 py-2 text-xs font-medium text-app-text-secondary">
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Chạy trên Google Veo 3.1
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-x-8">
                        {FOOTER_COLUMNS.map((column) => <FooterCol key={column.title} {...column} />)}
                    </div>
                </div>
                <div className="flex flex-col gap-4 border-t border-app-border py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-app-text-muted">© {YEAR} VideoGen AI · aiveo3.org</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link to="/privacy" className="text-xs text-app-text-muted transition-colors hover:text-app-accent">Chính sách bảo mật</Link>
                        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-app-border" />
                        <Link to="/terms" className="text-xs text-app-text-muted transition-colors hover:text-app-accent">Điều khoản sử dụng</Link>
                        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-app-border" />
                        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-xs font-medium text-app-text-secondary transition-colors hover:text-app-accent">Lên đầu trang ↑</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
