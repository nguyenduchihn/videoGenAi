import { ChevronRight, Clapperboard, Image as ImageIcon, Mic, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";

interface CapCardProps { icon: ReactNode; title: string; desc: string; }

function CapCard({ icon, title, desc }: CapCardProps) {
    return (
        <div className="group rounded-2xl border border-app-border bg-app-surface-soft p-5 transition duration-300 hover:-translate-y-1 hover:border-app-accent/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent-soft text-app-accent transition group-hover:bg-app-accent/15">
                {icon}
            </div>
            <h3 className="mt-5 text-sm font-semibold text-app-text">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-app-text-muted">{desc}</p>
            <div className="mt-5 flex items-center gap-1 text-[11px] font-medium text-app-text-muted transition group-hover:text-app-accent">
                Khám phá
                <ChevronRight className="h-3 w-3" />
            </div>
        </div>
    );
}

export function ProductPreview() {
    return (
        <section id="san-pham" aria-labelledby="product-heading" className="scroll-mt-20 border-t border-app-border bg-app-bg">
            <div className="mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-28">
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-accent">AI Capabilities</p>
                    <h2 id="product-heading" className="mt-4 text-3xl font-semibold tracking-tight text-app-text sm:text-4xl">
                        Một workspace.<br />Mọi cách tạo video.
                    </h2>
                    <p className="mt-5 text-sm leading-6 text-app-text-secondary sm:text-base">
                        Từ một ý tưởng đơn giản đến một video hoàn chỉnh, VideoGen AI hỗ trợ nhiều cách bắt đầu khác nhau.
                    </p>
                </div>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <CapCard
                        icon={<WandSparkles className="h-5 w-5" />}
                        title="Prompt → Video"
                        desc="Mô tả ý tưởng và để AI xây dựng video theo yêu cầu."
                    />
                    <CapCard
                        icon={<Clapperboard className="h-5 w-5" />}
                        title="Script → Video"
                        desc="Biến kịch bản thành nội dung video có cấu trúc."
                    />
                    <CapCard
                        icon={<ImageIcon className="h-5 w-5" />}
                        title="Image → Video"
                        desc="Biến hình ảnh tĩnh thành những chuyển động sống động."
                    />
                    <CapCard
                        icon={<Mic className="h-5 w-5" />}
                        title="Voice → Video"
                        desc="Kết hợp giọng nói với hình ảnh để tạo video."
                    />
                </div>
            </div>
        </section>
    );
}
