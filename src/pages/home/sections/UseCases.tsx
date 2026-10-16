import { ArrowUpRight, GraduationCap, Megaphone, ShoppingBag, Smartphone } from "lucide-react";

const CASES = [
    {
        n: "01",
        title: "Marketing",
        desc: "Tạo video quảng cáo, chiến dịch truyền thông và nội dung thương hiệu thu hút khách hàng.",
        tag: "Brand & Campaign",
        icon: <Megaphone className="h-5 w-5" />,
    },
    {
        n: "02",
        title: "Social Media",
        desc: "Sáng tạo nội dung cho TikTok, Reels, Shorts và các nền tảng mạng xã hội.",
        tag: "Short-form Content",
        icon: <Smartphone className="h-5 w-5" />,
    },
    {
        n: "03",
        title: "Sản phẩm",
        desc: "Biến hình ảnh sản phẩm thành video giới thiệu trực quan, chuyên nghiệp và hấp dẫn.",
        tag: "Product Showcase",
        icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
        n: "04",
        title: "Giáo dục",
        desc: "Xây dựng video bài giảng, nội dung hướng dẫn và tài liệu đào tạo dễ tiếp cận.",
        tag: "Learning & Training",
        icon: <GraduationCap className="h-5 w-5" />,
    },
];

export function UseCases() {
    return (
        <section
            id="ung-dung"
            aria-labelledby="cases-heading"
            className="scroll-mt-20 border-t border-app-border bg-app-bg"
        >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-app-accent/15 bg-app-accent-soft px-3.5 py-2 text-xs font-semibold text-app-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-app-accent" />
                            USE CASES
                        </div>

                        <h2
                            id="cases-heading"
                            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-app-text sm:text-4xl lg:text-5xl"
                        >
                            Một công cụ.
                            <br className="hidden sm:block" />{" "}
                            <span className="text-app-accent">
                                Nhiều cách sáng tạo.
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-lg text-sm leading-7 text-app-text-secondary sm:text-base lg:pb-1">
                        Từ marketing đến mạng xã hội, từ giới thiệu sản phẩm
                        đến giáo dục — VideoGen AI giúp bạn biến ý tưởng thành
                        nội dung video phù hợp với mục tiêu.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16">
                    {CASES.map((item) => (
                        <article
                            key={item.n}
                            className="group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-app-accent/35 hover:shadow-xl hover:shadow-app-accent/[0.05] sm:p-7"
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-app-accent/[0.035] blur-3xl transition-colors duration-300 group-hover:bg-app-accent/[0.10]"
                            />

                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-all duration-300 group-hover:bg-app-accent group-hover:text-white">
                                    {item.icon}
                                </div>

                                <span className="text-sm font-semibold tracking-wider text-app-text-muted/70">
                                    {item.n}
                                </span>
                            </div>

                            <div className="relative mt-6 flex flex-1 flex-col">
                                <h3 className="text-lg font-semibold tracking-tight text-app-text transition-colors group-hover:text-app-accent">
                                    {item.title}
                                </h3>

                                <p className="mt-3 max-w-xl text-sm leading-6 text-app-text-secondary">
                                    {item.desc}
                                </p>

                                <div className="mt-6 flex items-center justify-between gap-3 border-t border-app-border pt-4">
                                    <span className="text-xs font-medium text-app-text-muted">
                                        {item.tag}
                                    </span>

                                    <span
                                        aria-hidden="true"
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-app-border text-app-text-secondary transition-all duration-300 group-hover:border-app-accent/20 group-hover:bg-app-accent group-hover:text-white"
                                    >
                                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}