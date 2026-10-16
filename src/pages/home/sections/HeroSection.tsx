import type { CSSProperties } from "react";
import { ArrowRight, Play, Sparkles, WandSparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const heroVars = {
    "--hero-bg": "#0b0d14",
    "--hero-surface": "#10131c",
    "--hero-sidebar": "#0c0f17",
} as CSSProperties;

export function HeroSection() {
    const navigate = useNavigate();
    const scrollHow = () =>
        document.getElementById("cach-hoat-dong")?.scrollIntoView({ behavior: "smooth", block: "start" });

    return (
        <section
            style={heroVars}
            className="relative overflow-hidden [background:var(--hero-bg)]"
            aria-labelledby="hero-heading"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full blur-[120px]"
                style={{ background: "color-mix(in oklch, var(--app-accent) 12%, transparent)" }}
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-app-accent/20 bg-app-accent/10 px-3.5 py-1.5 text-xs font-medium text-app-accent">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Creative Workspace
                    </div>
                    <h1
                        id="hero-heading"
                        className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl"
                    >
                        Biến ý tưởng thành{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(to right, var(--app-accent), var(--app-accent-hover))" }}
                        >
                            video chuyên nghiệp.
                        </span>
                    </h1>
                    <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                        VideoGen AI giúp bạn biến prompt, kịch bản, hình ảnh và giọng nói thành những video hoàn chỉnh bằng AI — nhanh chóng, trực quan và dễ dàng.
                    </p>
                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-app-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-app-accent-hover sm:w-auto"
                        >
                            Đăng ký ngay
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <button
                            type="button"
                            onClick={scrollHow}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.07] sm:w-auto"
                        >
                            <Play className="h-4 w-4" />
                            Xem cách hoạt động
                        </button>
                    </div>
                </div>

                <div className="relative mx-auto mt-16 max-w-6xl lg:mt-20">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-10 rounded-[32px] blur-3xl"
                        style={{ background: "color-mix(in oklch, var(--app-accent) 8%, transparent)" }}
                    />
                    <p aria-hidden="true" className="mb-3 text-center text-[10px] uppercase tracking-widest text-white/25">
                        Minh hoạ giao diện
                    </p>
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] [background:var(--hero-surface)] shadow-2xl shadow-black/40">
                        <div className="flex h-11 items-center border-b border-white/[0.06] px-4">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                            </div>
                            <span className="mx-auto hidden text-[10px] text-white/25 sm:block">aiveo3.org</span>
                        </div>
                        <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[160px_1fr]">
                            <div className="hidden border-r border-white/[0.06] [background:var(--hero-sidebar)] p-4 md:block">
                                <div className="mb-6 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-app-accent/10">
                                        <Sparkles className="h-3.5 w-3.5 text-app-accent" />
                                    </span>
                                    <span className="text-xs font-semibold text-white/70">VideoGen AI</span>
                                </div>
                                <div className="space-y-1">
                                    {["Tổng quan", "Dự án", "Trình tạo AI", "Phương tiện"].map((item, i) => (
                                        <div
                                            key={item}
                                            className={`rounded-lg px-3 py-2 text-[11px] ${i === 2 ? "bg-app-accent/10 text-app-accent" : "text-white/30"}`}
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 sm:p-7">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-app-accent">AI Video Generator</p>
                                        <h3 className="mt-1 text-base font-semibold text-white">Tạo video mới</h3>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/[0.07] [background:var(--hero-sidebar)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <WandSparkles className="h-4 w-4 text-app-accent" />
                                        <span className="text-xs font-medium text-white/50">Bạn muốn tạo video gì?</span>
                                    </div>
                                    <div className="min-h-[80px] rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                                        <p className="text-xs leading-6 text-white/25">Tạo video quảng cáo thời trang nam, phong cách hiện đại, ánh sáng studio...</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/register")}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-app-accent px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-app-accent-hover"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Tạo video
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
