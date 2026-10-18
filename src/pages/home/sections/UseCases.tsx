import { ArrowUpRight, Cpu, GraduationCap, Megaphone, ShoppingBag, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePricing } from "@/hooks/usePricing";
import { Link } from "react-router-dom";
import { useReveal } from "../useReveal";
import { API_DOCS_URL } from "../landingCopy";

interface UseCase {
    title: string;
    desc: string;
    workers: string;
    icon: LucideIcon;
}

const CASES: UseCase[] = [
    { title: "Marketing", desc: "Video quảng cáo, teaser chiến dịch và nội dung thương hiệu từ kịch bản hoặc ảnh sản phẩm.", workers: "text-to-video · image-to-video", icon: Megaphone },
    { title: "Mạng xã hội", desc: "Clip ngắn cho TikTok, Reels, Shorts theo lô hàng chục biến thể, upscale lên 1080P hay 4K trước khi đăng.", workers: "text-to-video · upscale-video", icon: Smartphone },
    { title: "Sản phẩm", desc: "Giữ sản phẩm nhất quán qua ảnh tham chiếu, dựng cảnh xoay, mở hộp, chuyển cảnh đầu-cuối.", workers: "reference-images-to-video · start-end-image-to-video", icon: ShoppingBag },
    { title: "Giáo dục", desc: "Minh hoạ bài giảng, video hướng dẫn và ảnh minh họa từ mô tả văn bản.", workers: "text-to-video · text-to-image", icon: GraduationCap },
];

export function UseCases() {
    const { data } = usePricing();
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    const [gridRef, gridClass] = useReveal<HTMLDivElement>();
    const batch = data?.maxBatchTasks;
    return (
        <section id="ung-dung" aria-labelledby="cases-heading" className="scroll-mt-20 border-t border-app-border bg-app-bg">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:px-8 lg:py-24">
                <div ref={headRef} className={`${headClass} max-w-2xl`}>
                    <p className="eyebrow text-app-accent">Ứng dụng</p>
                    <h2 id="cases-heading" className="display-lg mt-4 text-app-text">
                        Một công cụ, <span className="text-app-accent">nhiều cách sáng tạo.</span>
                    </h2>
                </div>
                <div ref={gridRef} className={`${gridClass} mt-12 grid gap-4 sm:grid-cols-2`}>
                    {CASES.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="lift group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 hover:border-app-accent/35 hover:shadow-xl hover:shadow-app-accent/[0.05] sm:p-7">
                                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-app-accent/[0.035] blur-3xl transition-colors group-hover:bg-app-accent/[0.10]" />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-colors group-hover:bg-app-accent group-hover:text-white">
                                    <Icon className="h-5 w-5" aria-hidden />
                                </div>
                                <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-app-text">{item.title}</h3>
                                <p className="relative mt-3 flex-1 text-sm leading-6 text-app-text-secondary">{item.desc}</p>
                                <p className="relative mt-6 border-t border-app-border pt-4 font-mono text-[11px] text-app-text-muted">{item.workers}</p>
                            </article>
                        );
                    })}
                    <article className="lift group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-app-border bg-app-surface p-6 hover:border-app-accent/35 hover:shadow-xl hover:shadow-app-accent/[0.05] sm:col-span-2 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-colors group-hover:bg-app-accent group-hover:text-white">
                                <Cpu className="h-5 w-5" aria-hidden />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight text-app-text">Tự động hoá bằng API</h3>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-secondary">
                                    Nối thẳng vào pipeline của bạn: {batch ? `gửi tới ${batch} task mỗi request` : "gửi hàng loạt"}, nhận webhook khi xong, gửi lại an toàn nhờ Idempotency-Key, hoàn credit khi task lỗi.
                                </p>
                            </div>
                        </div>
                        <Link to={API_DOCS_URL} className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-app-border bg-app-bg px-4 py-2.5 text-sm font-semibold text-app-text transition hover:border-app-accent/30 hover:text-app-accent lg:self-center">
                            Xem tài liệu API <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </article>
                </div>
            </div>
        </section>
    );
}
