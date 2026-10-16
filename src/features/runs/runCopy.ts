import type { RunSummary } from "@/types/api";

export const RUN_STATUS_LABEL: Record<RunSummary["status"], string> = {
    active: "Đang chạy",
    done: "Hoàn tất",
    cancelled: "Đã huỷ",
};

/** Nhãn chi tiết hơn trạng thái thô (xếp hàng máy chủ, tạm dừng thiếu credit, chờ gửi tiếp). */
export function runStateLabel(run: RunSummary, remainingLocal = 0): string {
    if (run.status === "cancelled") return "Đã huỷ";
    if (run.pausedReason === "INSUFFICIENT_CREDITS") return "Tạm dừng: thiếu credit";
    if (remainingLocal > 0) return `Còn ${remainingLocal} job chờ gửi`;
    if (run.queuedOnServer > 0) return `Đang xếp hàng trên máy chủ (${run.queuedOnServer} job)`;
    if (run.status === "active") return "Đang chạy";
    return run.counts.failed > 0 && run.counts.succeeded === 0 ? "Thất bại" : "Hoàn tất";
}

export const doneCount = (run: RunSummary): number => run.counts.succeeded + run.counts.failed + run.counts.cancelled;

/** % hoàn tất trên tổng kế hoạch (job chờ gửi/xếp hàng tính là chưa xong). */
export function runPercent(run: RunSummary): number {
    const total = Math.max(run.totalPlanned, run.created + run.queuedOnServer, 1);
    return Math.min(100, Math.round((doneCount(run) / total) * 100));
}

export function formatEta(sec: number | null): string {
    if (sec === null) return "Đang ước tính…";
    if (sec < 60) return "Ước tính còn dưới 1 phút";
    const minutes = Math.round(sec / 60);
    if (minutes < 60) return `Ước tính còn ~${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `Ước tính còn ~${hours} giờ${rest ? ` ${rest} phút` : ""}`;
}

/** Tên mặc định: prompt đầu rút gọn · N job · ngày giờ. */
export function runAutoName(firstPrompt: string, count: number, at: Date = new Date()): string {
    const head = firstPrompt.trim().replace(/\s+/g, " ").slice(0, 40);
    const stamp = at.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `${head || "Lượt tạo"}${head.length === 40 ? "…" : ""} · ${count} job · ${stamp}`;
}

export const runDisplayName = (run: Pick<RunSummary, "name" | "id">): string => run.name?.trim() || `Lượt ${run.id.slice(0, 8)}`;

/** Nhịp poll tóm tắt lượt theo số job đang chờ/chạy: 3 s nhỏ, 10 s vừa, 20 s lớn. */
export function pollIntervalFor(active: number): number {
    if (active <= 20) return 3_000;
    if (active <= 200) return 10_000;
    return 20_000;
}
