import {
    ArrowDown,
    ArrowRight,
    Check,
    Clapperboard,
    SlidersHorizontal,
    Sparkles,
    WandSparkles,
} from "lucide-react";

const STEPS = [
    {
        n: "01",
        title: "Mô tả ý tưởng",
        desc: "Cho AI biết video bạn muốn tạo và phong cách mong muốn.",
        icon: <WandSparkles className="h-5 w-5" />,
    },
    {
        n: "02",
        title: "AI xây dựng nội dung",
        desc: "AI phân tích yêu cầu và tạo cấu trúc nội dung phù hợp.",
        icon: <Sparkles className="h-5 w-5" />,
    },
    {
        n: "03",
        title: "Tinh chỉnh",
        desc: "Chỉnh sửa nội dung, hình ảnh, giọng nói và phong cách.",
        icon: <SlidersHorizontal className="h-5 w-5" />,
    },
    {
        n: "04",
        title: "Xuất video",
        desc: "Hoàn thiện video và xuất sản phẩm theo nhu cầu.",
        icon: <Clapperboard className="h-5 w-5" />,
    },
];

export function HowItWorks() {
    return (
        <section
            id="cach-hoat-dong"
            aria-labelledby="how-heading"
            className="scroll-mt-20 border-t border-app-border bg-app-surface"
        >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-app-accent/15 bg-app-accent-soft px-3.5 py-2 text-xs font-semibold text-app-accent">
                        <Sparkles className="h-3.5 w-3.5" />
                        WORKFLOW
                    </div>

                    <h2
                        id="how-heading"
                        className="mt-6 text-3xl font-bold leading-tight tracking-tight text-app-text sm:text-4xl lg:text-5xl"
                    >
                        Từ ý tưởng đến video
                        <br className="hidden sm:block" />{" "}
                        <span className="text-app-accent">
                            chỉ trong vài bước
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-app-text-secondary sm:text-base">
                        Quy trình đơn giản giúp bạn tập trung vào sáng tạo,
                        thay vì những thao tác kỹ thuật phức tạp.
                    </p>
                </div>

                <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
                    <div
                        aria-hidden="true"
                        className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-app-accent/25 to-transparent lg:block"
                    />

                    {STEPS.map((step) => (
                        <article
                            key={step.n}
                            className="group relative flex h-full flex-col rounded-2xl border border-app-border bg-app-bg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-app-accent/35 hover:shadow-xl hover:shadow-app-accent/[0.05]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold tracking-[0.18em] text-app-text-muted">
                                    STEP {step.n}
                                </span>

                                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-all duration-300 group-hover:bg-app-accent group-hover:text-white">
                                    {step.icon}
                                </span>
                            </div>

                            <div className="mt-7 flex items-center gap-3">
                                <span className="text-3xl font-bold tracking-tight text-app-accent/35 transition-colors group-hover:text-app-accent">
                                    {step.n}
                                </span>

                                <div className="h-px flex-1 bg-app-border transition-colors group-hover:bg-app-accent/30" />
                            </div>

                            <h3 className="mt-5 text-base font-semibold leading-6 text-app-text">
                                {step.title}
                            </h3>

                            <p className="mt-3 flex-1 text-sm leading-6 text-app-text-secondary">
                                {step.desc}
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-app-text-muted">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app-accent/10 text-app-accent">
                                    <Check className="h-3 w-3" />
                                </span>
                                Đơn giản và trực quan
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-xs text-app-text-muted">
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>Quy trình sáng tạo video bằng AI</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </section>
    );
}
