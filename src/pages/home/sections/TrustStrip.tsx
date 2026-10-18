import { Layers, QrCode, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePricing } from "@/hooks/usePricing";

interface TrustItem {
    icon: LucideIcon;
    text: string;
}

/** Dải tin cậy ngay dưới hero: chỉ nói điều hệ thống thật sự làm, không bịa số liệu người dùng. */
export function TrustStrip() {
    const { data } = usePricing();
    const batch = data?.maxBatchTasks;
    const items: TrustItem[] = [
        { icon: Sparkles, text: "Model Google Veo 3.1 cho video, ảnh và upscale" },
        { icon: Layers, text: batch ? `Một request tạo tới ${batch} task, hàng đợi trên máy chủ` : "Chạy hàng loạt, hàng đợi trên máy chủ" },
        { icon: RotateCcw, text: "Task lỗi được hoàn credit tự động" },
        data?.commercialMode === "subscription"
            ? { icon: ShieldCheck, text: "Gói theo kỳ, kích hoạt tự động sau chuyển khoản" }
            : { icon: QrCode, text: "Nạp bằng VietQR, credit cộng tự động trong vài phút" },
    ];
    return (
        <section aria-label="Điểm tin cậy" className="border-b border-app-border bg-app-surface">
            <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-3 px-4 py-5 text-sm text-app-text-secondary sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                {items.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent">
                            <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="leading-5">{text}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
