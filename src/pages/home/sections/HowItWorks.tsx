import { Bell, Download, KeyRound, LayoutGrid, Send, SlidersHorizontal, Sparkles, WandSparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useReveal } from "../useReveal";

interface Step {
    title: string;
    desc: string;
    icon: LucideIcon;
}

const STUDIO: Step[] = [
    { title: "Chọn chế độ", desc: "Văn bản → Video, Ảnh → Video, ảnh tham chiếu, khung đầu/cuối, kéo dài video, tạo ảnh hay upscale.", icon: LayoutGrid },
    { title: "Nhập prompt hoặc tải ảnh", desc: "Mỗi dòng prompt là một job; chọn tỷ lệ, thời lượng, model. Ảnh đính kèm được tải lên lúc bấm Tạo.", icon: WandSparkles },
    { title: "Veo 3.1 xử lý", desc: "Lượt tạo xếp hàng trên máy chủ, chạy song song theo gói; tắt tab vẫn tiếp tục, mở lại thấy tiến độ.", icon: Sparkles },
    { title: "Tải về hoặc dùng tiếp", desc: "Xem, tải từng file hay cả lượt, lưu trong Thư viện; video có thể kéo dài thêm ngay từ thẻ kết quả.", icon: Download },
];

const API: Step[] = [
    { title: "Tạo API key", desc: "Trong Cài đặt › API keys. Key dạng vk_… hiện một lần; gửi qua header X-API-Key.", icon: KeyRound },
    { title: "POST /v1/tasks", desc: "Một request gửi cả lô task (worker + params). Thêm Idempotency-Key để gửi lại an toàn khi mạng lỗi.", icon: Send },
    { title: "Nhận kết quả", desc: "Webhook gọi về khi lô xong, hoặc poll GET /v1/batches/:id. Lỗi theo một định dạng duy nhất kèm requestId.", icon: Bell },
    { title: "Tinh chỉnh & mở rộng", desc: "Đổi model, tỷ lệ, thời lượng theo bảng giá; upscale hay kéo dài video chỉ là một task khác.", icon: SlidersHorizontal },
];

function StepGrid({ steps }: { steps: Step[] }) {
    return (
        <ol className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-9 hidden h-px bg-gradient-to-r from-transparent via-app-accent/30 to-transparent lg:block" />
            {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                    <li key={step.title} className="lift group relative flex h-full flex-col rounded-2xl border border-app-border bg-app-bg p-6 hover:border-app-accent/35 hover:shadow-xl hover:shadow-app-accent/[0.05]">
                        <div className="flex items-center justify-between">
                            <span className="num text-xs font-bold tracking-[0.18em] text-app-text-muted">BƯỚC {String(i + 1).padStart(2, "0")}</span>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-app-accent/10 bg-app-accent-soft text-app-accent transition-colors group-hover:bg-app-accent group-hover:text-white">
                                <Icon className="h-5 w-5" aria-hidden />
                            </span>
                        </div>
                        <h3 className="mt-7 text-base font-semibold leading-6 text-app-text">{step.title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-6 text-app-text-secondary">{step.desc}</p>
                    </li>
                );
            })}
        </ol>
    );
}

export function HowItWorks() {
    const [tab, setTab] = useState("studio");
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    return (
        <section id="cach-hoat-dong" aria-labelledby="how-heading" className="scroll-mt-20 border-t border-app-border bg-app-surface">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:px-8 lg:py-24">
                <Tabs value={tab} onChange={setTab}>
                <div ref={headRef} className={`${headClass} flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between`}>
                    <div className="max-w-2xl">
                        <p className="eyebrow text-app-accent">Cách dùng</p>
                        <h2 id="how-heading" className="display-lg mt-4 text-app-text">
                            Bốn bước, <span className="text-app-accent">hai cách dùng.</span>
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-app-text-secondary sm:text-base">
                            Người làm nội dung dùng Studio trong trình duyệt; lập trình viên gọi API từ hệ thống của mình. Cùng một hàng đợi, cùng một bảng giá.
                        </p>
                    </div>
                    <TabsList aria-label="Chọn cách dùng" className="w-full max-w-xs">
                        <TabsTrigger value="studio">Studio</TabsTrigger>
                        <TabsTrigger value="api">API</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="studio"><StepGrid steps={STUDIO} /></TabsContent>
                <TabsContent value="api"><StepGrid steps={API} /></TabsContent>
                </Tabs>
            </div>
        </section>
    );
}
