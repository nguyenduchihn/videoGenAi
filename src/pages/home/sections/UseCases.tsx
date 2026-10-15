import { ArrowRight } from "lucide-react";

const CASES = [
    { n: "01", title: "Marketing", desc: "Tạo video quảng cáo, campaign và nội dung thương hiệu." },
    { n: "02", title: "Social Media", desc: "Tạo nội dung cho TikTok, Reels, Shorts và các nền tảng xã hội." },
    { n: "03", title: "Sản phẩm", desc: "Giới thiệu sản phẩm bằng video trực quan và chuyên nghiệp." },
    { n: "04", title: "Giáo dục", desc: "Xây dựng video bài giảng, hướng dẫn và nội dung đào tạo." },
];

export function UseCases() {
    return (
        <section id="ung-dung" aria-labelledby="cases-heading" className="scroll-mt-20 border-t border-app-border bg-app-bg">
            <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-28">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-accent">Use Cases</p>
                        <h2 id="cases-heading" className="mt-4 text-3xl font-semibold tracking-tight text-app-text sm:text-4xl">
                            Tạo video cho mọi nhu cầu
                        </h2>
                    </div>
                    <p className="max-w-lg text-sm leading-6 text-app-text-secondary">
                        Từ nội dung marketing đến social media, sản phẩm và giáo dục — một workspace cho nhiều mục đích khác nhau.
                    </p>
                </div>
                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {CASES.map((c) => (
                        <div key={c.n} className="group relative overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 transition duration-300 hover:border-app-accent/30">
                            <span className="absolute right-5 top-5 text-xs font-medium text-app-text-muted">{c.n}</span>
                            <div className="max-w-md">
                                <h3 className="text-lg font-semibold text-app-text transition group-hover:text-app-accent">{c.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-app-text-secondary">{c.desc}</p>
                                <div className="mt-6 flex items-center gap-1 text-xs text-app-text-muted transition group-hover:text-app-accent">
                                    Tìm hiểu thêm
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
