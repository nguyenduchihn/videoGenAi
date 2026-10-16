import { ChevronRight, Clapperboard, Image as ImageIcon, Mic, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";

interface CapCardProps {
    icon: ReactNode;
    title: string;
    desc: string;
}

function CapCard({ icon, title, desc }: CapCardProps) {
    return (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-app-accent/40 hover:shadow-xl hover:shadow-app-accent/[0.06]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-app-accent/[0.04] blur-2xl transition group-hover:bg-app-accent/[0.10]"
            />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-all duration-300 group-hover:scale-105 group-hover:bg-app-accent group-hover:text-white">
                {icon}
            </div>

            <h3 className="relative mt-6 text-base font-semibold tracking-tight text-app-text">
                {title}
            </h3>

            <p className="relative mt-3 flex-1 text-sm leading-6 text-app-text-secondary">
                {desc}
            </p>

            <div className="relative mt-6 flex items-center gap-1.5 text-xs font-semibold text-app-text-muted transition-colors group-hover:text-app-accent">
                Khám phá
                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
        </div>
    );
}

export function ProductPreview() {
    return (
        <section
            id="san-pham"
            aria-labelledby="product-heading"
            className="scroll-mt-20 border-t border-app-border bg-app-bg"
        >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-app-accent/15 bg-app-accent-soft px-3.5 py-2 text-xs font-semibold text-app-accent">
                        <WandSparkles className="h-3.5 w-3.5" />
                        AI CAPABILITIES
                    </div>

                    <h2
                        id="product-heading"
                        className="mt-6 text-3xl font-bold leading-tight tracking-tight text-app-text sm:text-4xl lg:text-5xl"
                    >
                        Một workspace.
                        <br />
                        <span className="text-app-accent">
                            Mọi cách tạo video.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-app-text-secondary sm:text-base">
                        Từ một ý tưởng đơn giản đến một video hoàn chỉnh,
                        VideoGen AI giúp bạn sáng tạo nội dung theo nhiều
                        cách khác nhau — nhanh chóng và trực quan.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
                    <CapCard
                        icon={<WandSparkles className="h-5 w-5" />}
                        title="Prompt → Video"
                        desc="Mô tả ý tưởng bằng ngôn ngữ tự nhiên và để AI biến nó thành video."
                    />

                    <CapCard
                        icon={<Clapperboard className="h-5 w-5" />}
                        title="Script → Video"
                        desc="Chuyển kịch bản thành nội dung video có bố cục và mạch kể chuyện."
                    />

                    <CapCard
                        icon={<ImageIcon className="h-5 w-5" />}
                        title="Image → Video"
                        desc="Thêm chuyển động vào hình ảnh tĩnh để tạo nên những khung hình sống động."
                    />

                    <CapCard
                        icon={<Mic className="h-5 w-5" />}
                        title="Voice → Video"
                        desc="Kết hợp giọng nói với hình ảnh để xây dựng trải nghiệm video hấp dẫn."
                    />
                </div>
            </div>
        </section>
    );
}
