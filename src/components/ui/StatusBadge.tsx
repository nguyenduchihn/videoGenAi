import { Badge } from "./Badge";
import type { BadgeVariant } from "./Badge";

type StatusConfig = { label: string; variant: BadgeVariant; dot: boolean };

const TASK_STATUS: Record<string, StatusConfig> = {
    pending: { label: "Đang chờ", variant: "warning", dot: true },
    processing: { label: "Đang xử lý", variant: "info", dot: true },
    succeeded: { label: "Hoàn thành", variant: "success", dot: false },
    completed: { label: "Hoàn thành", variant: "success", dot: false },
    failed: { label: "Thất bại", variant: "danger", dot: false },
    cancelled: { label: "Đã huỷ", variant: "default", dot: false },
};

const INTENT_STATUS: Record<string, StatusConfig> = {
    pending: { label: "Chờ thanh toán", variant: "warning", dot: true },
    paid: { label: "Đã thanh toán", variant: "success", dot: false },
    failed: { label: "Thất bại", variant: "danger", dot: false },
    cancelled: { label: "Đã huỷ", variant: "default", dot: false },
    expired: { label: "Hết hạn", variant: "default", dot: false },
};

interface StatusBadgeProps {
    status: string;
    /** `task` (mặc định) cho tác vụ, `intent` cho lệnh nạp (nhãn "Chờ thanh toán"…). */
    kind?: "task" | "intent";
    className?: string;
}

export function StatusBadge({ status, kind = "task", className }: StatusBadgeProps) {
    const table = kind === "intent" ? INTENT_STATUS : TASK_STATUS;
    const config = table[status] ?? { label: status, variant: "default" as BadgeVariant, dot: false };
    return (
        <Badge variant={config.variant} dot={config.dot} className={className}>
            {config.label}
        </Badge>
    );
}
