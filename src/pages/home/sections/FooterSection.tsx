import { Sparkles } from "lucide-react";

interface FooterColProps { title: string; items: string[]; }

function FooterCol({ title, items }: FooterColProps) {
    return (
        <div>
            <h4 className="text-xs font-semibold text-app-text-secondary">{title}</h4>
            <div className="mt-4 space-y-3">
                {items.map((item) => (
                    <p key={item} className="text-xs text-app-text-muted">{item}</p>
                ))}
            </div>
        </div>
    );
}

const YEAR = new Date().getFullYear();

export function FooterSection() {
    return (
        <footer className="border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                <div className="flex flex-col justify-between gap-8 md:flex-row">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent">
                                <Sparkles className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-sm font-semibold text-app-text">
                                VideoGen <span className="text-app-accent">AI</span>
                            </span>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-app-text-muted">
                            AI Creative Workspace giúp bạn biến ý tưởng thành những video chuyên nghiệp.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
                        <FooterCol
                            title="Sản phẩm"
                            items={["AI Video Generator", "Dự án", "Phương tiện"]}
                        />
                        <FooterCol
                            title="Tài nguyên"
                            items={["Cách hoạt động", "Bảng giá", "Hỗ trợ"]}
                        />
                        <FooterCol
                            title="Tài khoản"
                            items={["Đăng nhập", "Đăng ký"]}
                        />
                    </div>
                </div>
                <div className="mt-10 flex flex-col justify-between gap-3 border-t border-app-border pt-6 text-xs text-app-text-muted sm:flex-row">
                    <span>© {YEAR} VideoGen AI. All rights reserved.</span>
                    <div className="flex gap-5">
                        <a href="/privacy" className="transition hover:text-app-text-secondary">Bảo mật</a>
                        <a href="/terms" className="transition hover:text-app-text-secondary">Điều khoản</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
