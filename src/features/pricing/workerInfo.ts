import { ArrowUpToLine, Clapperboard, Film, Image as ImageIcon, Images, Sparkles, Video, type LucideIcon } from "lucide-react";
import type { PricingWorker } from "@/types/api";

export type WorkerKind = "video" | "image";

export interface WorkerInfo {
    label: string;
    description: string;
    icon: LucideIcon;
    kind: WorkerKind;
}

/** Thứ tự hiển thị trên landing và trang giá: video trước, ảnh sau, upscale cuối. */
export const WORKER_ORDER = [
    "text-to-video",
    "image-to-video",
    "reference-images-to-video",
    "start-end-image-to-video",
    "extend-video",
    "text-to-image",
    "image-to-image",
    "upscale-image",
    "upscale-video",
] as const;

/** Nhãn/mô tả tiếng Việt cho từng worker thật của API — nguồn duy nhất, landing và /pricing cùng dùng để không lệch sản phẩm. */
export const WORKER_INFO: Record<string, WorkerInfo> = {
    "text-to-video": { label: "Text → Video", description: "Mô tả bằng văn bản, nhận video Veo 3.1 hoàn chỉnh.", icon: Video, kind: "video" },
    "image-to-video": { label: "Image → Video", description: "Thổi chuyển động vào một bức ảnh tĩnh.", icon: ImageIcon, kind: "video" },
    "reference-images-to-video": { label: "Reference Images → Video", description: "Giữ nhân vật, sản phẩm nhất quán từ tối đa 3 ảnh tham chiếu.", icon: Images, kind: "video" },
    "start-end-image-to-video": { label: "Start / End Image → Video", description: "Chỉ định khung hình đầu và cuối, AI dựng chuyển cảnh ở giữa.", icon: Film, kind: "video" },
    "extend-video": { label: "Extend Video", description: "Kéo dài video đã tạo thêm một đoạn liền mạch.", icon: Clapperboard, kind: "video" },
    "text-to-image": { label: "Text → Image", description: "Tạo ảnh từ prompt văn bản.", icon: Sparkles, kind: "image" },
    "image-to-image": { label: "Image → Image", description: "Biến đổi ảnh có sẵn theo mô tả.", icon: ImageIcon, kind: "image" },
    "upscale-image": { label: "Upscale ảnh", description: "Nâng độ phân giải ảnh lên 2K hoặc 4K.", icon: ArrowUpToLine, kind: "image" },
    "upscale-video": { label: "Upscale video", description: "Nâng video lên 1080P hoặc 4K.", icon: ArrowUpToLine, kind: "video" },
};

const FALLBACK: WorkerInfo = { label: "", description: "Dịch vụ AI trong hệ thống VideoGen AI.", icon: Sparkles, kind: "video" };

export function getWorkerInfo(key: string): WorkerInfo {
    return WORKER_INFO[key] ?? { ...FALLBACK, label: key };
}

/** Sắp xếp các worker API trả về theo WORKER_ORDER; worker lạ xếp cuối theo tên. */
export function orderWorkers(keys: string[]): string[] {
    const rank = (k: string) => { const i = (WORKER_ORDER as readonly string[]).indexOf(k); return i === -1 ? WORKER_ORDER.length : i; };
    return [...keys].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** Giá rẻ nhất của worker: giá mặc định (`*`) hoặc model rẻ nhất; null khi admin chưa đặt giá. */
export function cheapestCredits(worker: Pick<PricingWorker, "credits" | "models"> | undefined): number | null {
    if (!worker) return null;
    const prices = [worker.credits, ...Object.values(worker.models)].filter((v): v is number => typeof v === "number");
    return prices.length ? Math.min(...prices) : null;
}
