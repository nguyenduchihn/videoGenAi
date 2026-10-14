import { ArrowRight, Check, Play, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
    "Quản lý dự án tập trung",
    "AI hỗ trợ xuyên suốt quy trình",
    "Không gian làm việc trực quan",
    "Dễ dàng mở rộng workflow",
];

export function PricingTeaser() {
    return (
        <>
            <section className="border-t border-app-border bg-app-surface">
                <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-accent">Creative Workspace</p>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-app-text sm:text-4xl">
                                Mọi công cụ cần thiết,<br />trong một nơi.
                            </h2>
                            <p className="mt-5 max-w-lg text-sm leading-6 text-app-text-secondary sm:text-base">
                                Không cần chuyển qua nhiều công cụ. Từ ý tưởng, nội dung, tài nguyên cho đến video cuối cùng đều được quản lý trong cùng một workspace.
                            </p>
                            <div className="mt-8 space-y-4">
                                {FEATURES.map((f) => (
                                    <div key={f} className="flex items-center gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-app-accent-soft">
                                            <Check className="h-3 w-3 text-app-accent" />
                                        </span>
                                        <span className="text-sm text-app-text-secondary">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            className="relative overflow-hidden rounded-2xl border border-app-border bg-app-bg shadow-2xl"
                            aria-label="Minh hoạ workspace"
                        >
                            <div className="flex h-10 items-center border-b border-app-border px-4">
                                <div className="flex gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-app-border" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-app-border" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-app-border" />
                                </div>
                            </div>
                            <div className="grid grid-cols-[150px_1fr]">
                                <div className="border-r border-app-border bg-app-surface-soft p-3">
                                    <div className="mb-5 h-6 w-24 rounded bg-app-border" />
                                    <div className="space-y-2">
                                        <div className="h-7 rounded bg-app-accent-soft" />
                                        <div className="h-7 rounded bg-app-border/40" />
                                        <div className="h-7 rounded bg-app-border/40" />
                                        <div className="h-7 rounded bg-app-border/40" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="h-2 w-16 rounded bg-app-accent/20" />
                                            <div className="mt-2 h-4 w-32 rounded bg-app-border" />
                                        </div>
                                        <div className="h-7 w-20 rounded-lg bg-app-surface-soft" />
                                    </div>
                                    <div className="mt-5 aspect-video overflow-hidden rounded-xl bg-app-surface-soft">
                                        <div className="flex h-full items-center justify-center">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-app-border bg-app-surface">
                                                <Play className="h-4 w-4 text-app-accent" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <div className="h-10 flex-1 rounded-lg bg-app-surface-soft" />
                                        <div className="h-10 w-24 rounded-lg bg-app-accent-soft" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="bang-gia" aria-labelledby="pricing-heading" className="scroll-mt-20 border-t border-app-border bg-app-bg">
                <div className="mx-auto max-w-4xl px-4 py-24 text-center lg:px-8 lg:py-28">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-app-accent/20 bg-app-accent-soft">
                        <Zap className="h-5 w-5 text-app-accent" />
                    </span>
                    <h2 id="pricing-heading" className="mt-6 text-3xl font-semibold tracking-tight text-app-text sm:text-5xl">
                        Sẵn sàng tạo video?
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-app-text-secondary sm:text-base">
                        Bắt đầu với VideoGen AI và biến những ý tưởng của bạn thành nội dung video chuyên nghiệp.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            to="/register"
                            className="group inline-flex items-center gap-2 rounded-xl bg-app-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-app-accent-hover"
                        >
                            Đăng ký ngay
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center rounded-xl border border-app-border bg-app-surface px-6 py-3.5 text-sm font-medium text-app-text transition hover:bg-app-surface-soft"
                        >
                            Xem bảng giá
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
