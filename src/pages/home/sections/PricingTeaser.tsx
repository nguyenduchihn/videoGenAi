import {
    ArrowRight,
    Check,
    Play,
    Sparkles,
    Zap,
} from "lucide-react";
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
            <section
                aria-labelledby="workspace-heading"
                className="overflow-hidden border-t border-app-border bg-app-surface"
            >
                <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-app-accent/15 bg-app-accent-soft px-3.5 py-2 text-xs font-semibold text-app-accent">
                                <Sparkles className="h-3.5 w-3.5" />
                                CREATIVE WORKSPACE
                            </div>

                            <h2
                                id="workspace-heading"
                                className="mt-6 text-3xl font-bold leading-tight tracking-tight text-app-text sm:text-4xl lg:text-5xl"
                            >
                                Mọi công cụ cần thiết,
                                <br />
                                <span className="text-app-accent">
                                    trong một nơi.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-lg text-sm leading-7 text-app-text-secondary sm:text-base">
                                Không cần chuyển qua nhiều công cụ. Từ ý
                                tưởng, nội dung, tài nguyên cho đến video
                                cuối cùng đều được quản lý trong cùng một
                                workspace.
                            </p>

                            <div className="mt-8 space-y-4">
                                {FEATURES.map((feature) => (
                                    <div
                                        key={feature}
                                        className="group flex items-center gap-3"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-app-accent/10 bg-app-accent-soft transition-colors group-hover:bg-app-accent">
                                            <Check className="h-3.5 w-3.5 text-app-accent transition-colors group-hover:text-white" />
                                        </span>

                                        <span className="text-sm leading-6 text-app-text-secondary transition-colors group-hover:text-app-text">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/register"
                                className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-app-accent transition-colors hover:text-app-accent-hover"
                            >
                                Khám phá VideoGen AI
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-app-accent/[0.06] blur-3xl"
                            />

                            <div
                                aria-label="Minh họa giao diện workspace"
                                className="relative overflow-hidden rounded-2xl border border-app-border bg-app-bg shadow-2xl shadow-app-accent/[0.06] transition-transform duration-500 hover:-translate-y-1"
                            >
                                <div className="flex h-12 items-center justify-between border-b border-app-border bg-app-surface px-4 sm:px-5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#f6bd4f]" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#45c98b]" />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-3.5 w-3.5 text-app-accent" />
                                        <span className="text-xs font-semibold text-app-text-secondary">
                                            VideoGen AI
                                        </span>
                                    </div>

                                    <div className="h-2 w-10 rounded-full bg-app-border" />
                                </div>

                                <div className="grid grid-cols-[92px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)]">
                                    <aside className="border-r border-app-border bg-app-surface-soft p-2.5 sm:p-4">
                                        <div className="mb-5 flex items-center gap-2 px-1">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-app-accent text-white">
                                                <Sparkles className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="hidden text-xs font-bold text-app-text sm:block">
                                                Workspace
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex h-8 items-center gap-2 rounded-lg bg-app-accent-soft px-2">
                                                <span className="h-3 w-3 shrink-0 rounded bg-app-accent/50" />
                                                <span className="hidden h-2 w-14 rounded bg-app-accent/40 sm:block" />
                                            </div>

                                            {[1, 2, 3, 4].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex h-8 items-center gap-2 rounded-lg px-2"
                                                >
                                                    <span className="h-3 w-3 shrink-0 rounded bg-app-border" />
                                                    <span className="hidden h-2 w-12 rounded bg-app-border sm:block" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 hidden rounded-xl border border-app-border bg-app-surface p-3 sm:block">
                                            <div className="h-2 w-12 rounded bg-app-border" />
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-app-border">
                                                <div className="h-full w-2/3 rounded-full bg-app-accent" />
                                            </div>
                                            <div className="mt-2 h-2 w-16 rounded bg-app-border/70" />
                                        </div>
                                    </aside>

                                    <div className="min-w-0 p-3 sm:p-5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-medium text-app-text-muted sm:text-xs">
                                                    CREATIVE STUDIO
                                                </p>
                                                <h3 className="mt-1 truncate text-sm font-bold text-app-text sm:text-base">
                                                    Dự án của bạn
                                                </h3>
                                            </div>

                                            <span className="shrink-0 rounded-lg bg-app-accent px-2.5 py-2 text-[10px] font-semibold text-white sm:px-3 sm:text-xs">
                                                + Tạo mới
                                            </span>
                                        </div>

                                        <div className="mt-5 overflow-hidden rounded-xl border border-app-border bg-app-surface">
                                            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-[#e9e5ff] via-[#f3efff] to-[#d9e7ff]">
                                                <div
                                                    aria-hidden="true"
                                                    className="absolute -left-8 top-0 h-32 w-32 rounded-full bg-violet-300/40 blur-2xl"
                                                />
                                                <div
                                                    aria-hidden="true"
                                                    className="absolute -bottom-12 right-0 h-36 w-36 rounded-full bg-blue-300/40 blur-2xl"
                                                />

                                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/85 text-app-accent shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110 sm:h-14 sm:w-14">
                                                    <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
                                                </div>

                                                <span className="absolute bottom-3 left-3 rounded-md border border-white/50 bg-white/75 px-2 py-1 text-[9px] font-semibold text-slate-700 backdrop-blur-sm sm:text-[10px]">
                                                    AI VIDEO PREVIEW
                                                </span>
                                            </div>

                                            <div className="p-3 sm:p-4">
                                                <div className="h-2 w-2/5 rounded-full bg-app-border" />
                                                <div className="mt-2 h-2 w-3/5 rounded-full bg-app-border/60" />

                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="h-7 min-w-0 flex-1 rounded-lg bg-app-surface-soft sm:h-9" />
                                                    <div className="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent sm:h-9 sm:w-12">
                                                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map((item) => (
                                                <div
                                                    key={item}
                                                    className="rounded-lg border border-app-border bg-app-surface p-2"
                                                >
                                                    <div
                                                        className={`aspect-[4/3] rounded-md ${item === 1
                                                            ? "bg-app-accent-soft"
                                                            : item === 2
                                                                ? "bg-blue-100"
                                                                : "bg-violet-100"
                                                            }`}
                                                    />
                                                    <div className="mt-2 h-1.5 w-3/4 rounded-full bg-app-border" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-xl border border-app-border bg-app-surface px-4 py-3 shadow-lg sm:flex">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent">
                                    <Zap className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-app-text">
                                        AI-powered workflow
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-app-text-muted">
                                        Tất cả trong một workspace
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="bang-gia"
                aria-labelledby="pricing-heading"
                className="scroll-mt-20 border-t border-app-border bg-app-bg"
            >
                <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-24 lg:px-8 lg:py-28">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-app-accent/15 bg-app-accent-soft text-app-accent shadow-sm">
                        <Zap className="h-6 w-6" />
                    </span>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-app-accent">
                        Start creating today
                    </p>

                    <h2
                        id="pricing-heading"
                        className="mt-4 text-3xl font-bold tracking-tight text-app-text sm:text-5xl"
                    >
                        Sẵn sàng tạo video?
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-app-text-secondary sm:text-base">
                        Bắt đầu với VideoGen AI và biến những ý tưởng của bạn
                        thành nội dung video chuyên nghiệp.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            to="/register"
                            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-app-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-app-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-app-accent-hover hover:shadow-xl hover:shadow-app-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2"
                        >
                            Đăng ký miễn phí
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>

                        <Link
                            to="/pricing"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-6 py-3.5 text-sm font-semibold text-app-text transition-colors hover:border-app-accent/30 hover:bg-app-surface-soft hover:text-app-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2"
                        >
                            Xem bảng giá
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <p className="mt-5 text-xs text-app-text-muted">
                        Bắt đầu dễ dàng · Không gian sáng tạo tập trung
                    </p>
                </div>
            </section>
        </>
    );
}
