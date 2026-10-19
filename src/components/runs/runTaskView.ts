import type { RunViewMode } from "./runTabs";
import { VIDEO_WORKERS } from "@/features/tasks/workerLabels";
import { describeTaskError } from "@/features/generator/errorCopy";
import type { PortalTask } from "@/types/api";

export const isVideoTask = (task: PortalTask): boolean => VIDEO_WORKERS.has(task.worker);
export const taskNumber = (task: PortalTask): number => (task.runIndex ?? 0) + 1;
export const taskAlt = (task: PortalTask): string => `Kết quả #${taskNumber(task)}: ${(task.prompt ?? "").slice(0, 80)}`;
export const isActiveTask = (task: PortalTask): boolean => task.status === "pending" || task.status === "processing";
export const taskErrorText = (task: PortalTask): string | null => (task.error ? describeTaskError(task.error.code, task.error.message) : null);

export const STATUS_LABEL: Record<PortalTask["status"], string> = {
    pending: "Đang chờ",
    processing: "Đang tạo",
    succeeded: "Hoàn thành",
    failed: "Thất bại",
    cancelled: "Đã huỷ",
};

export const STATUS_CLASS: Record<PortalTask["status"], string> = {
    pending: "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]",
    processing: "bg-[var(--app-warning-soft)] text-[var(--app-warning)]",
    succeeded: "bg-[var(--app-success-soft)] text-[var(--app-success)]",
    failed: "bg-[var(--app-danger-soft)] text-[var(--app-danger)]",
    cancelled: "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]",
};

export interface RunTaskActions {
    onRetry?: (task: PortalTask) => void;
    onCancel?: (task: PortalTask) => void;
    onDownload?: (task: PortalTask) => void;
    /** URL presigned hết hạn ⇒ tải lại task. */
    onRefresh?: (task: PortalTask) => void;
}

/** Thẻ kết quả rộng tối thiểu 272 px (thay vì chia cứng 3 cột) ⇒ nội dung 1.290 px: 4 cột, 1.024: 3, tablet: 2, điện thoại: 1. */
export const MIN_CARD_PX = 272;
export const CARD_GAP_PX = 12;
export function columnsFor(width: number, mode: RunViewMode): number {
    if (mode === "rows") return 1;
    return Math.max(1, Math.floor((width + CARD_GAP_PX) / (MIN_CARD_PX + CARD_GAP_PX)));
}

/** Nút hành động dạng icon 32 px (thẻ và hàng gọn dùng chung); nhãn đặt ở aria-label + title. */
export const ICON_BUTTON = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-40";
export const ICON_BUTTON_PRIMARY = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)] disabled:text-[var(--app-text-muted)]";
