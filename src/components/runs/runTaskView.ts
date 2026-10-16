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
    onExtend?: (task: PortalTask) => void;
    /** URL presigned hết hạn ⇒ tải lại task. */
    onRefresh?: (task: PortalTask) => void;
}

/** Số cột thẻ theo bề rộng khung (360 px: 1 cột). */
export function columnsFor(width: number, mode: RunViewMode): number {
    if (mode === "rows") return 1;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1400) return 3;
    return 4;
}
