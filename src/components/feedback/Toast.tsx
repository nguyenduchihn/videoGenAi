import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ToastItem } from "@/stores/feedback.store";
import { useFeedbackStore } from "@/stores/feedback.store";
import { CopyButton } from "@/components/ui";
import { cn } from "@/lib/cn";

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES = {
    success: "bg-[var(--app-success-soft)] border-[var(--app-success)]",
    error:   "bg-[var(--app-danger-soft)] border-[var(--app-danger)]",
    warning: "bg-[var(--app-warning-soft)] border-[var(--app-warning)]",
    info:    "bg-[var(--app-info-soft)] border-[var(--app-info)]",
};

const ICON_COLORS = {
    success: "text-[var(--app-success)]",
    error:   "text-[var(--app-danger)]",
    warning: "text-[var(--app-warning)]",
    info:    "text-[var(--app-info)]",
};

export function Toast({ item }: { item: ToastItem }) {
    const removeToast = useFeedbackStore((s) => s.removeToast);
    const [visible, setVisible] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const scheduleRef = useRef<() => void>(() => {});

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const dismiss = () => {
            setVisible(false);
            setTimeout(() => removeToast(item.id), 200);
        };
        scheduleRef.current = () => {
            clearTimeout(timer.current);
            timer.current = setTimeout(dismiss, item.duration);
        };
        scheduleRef.current();
        return () => clearTimeout(timer.current);
    }, [item.id, item.duration, removeToast]);

    const Icon = ICONS[item.variant];

    return (
        <div
            onMouseEnter={() => clearTimeout(timer.current)}
            onMouseLeave={() => scheduleRef.current()}
            className={cn(
                "flex items-start gap-3 rounded-xl border p-3 shadow-lg",
                "transition-[opacity,transform] duration-200 motion-reduce:transition-none",
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                STYLES[item.variant],
            )}
        >
            <Icon
                className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_COLORS[item.variant])}
                aria-hidden
            />
            <div className="min-w-0 flex-1 text-xs">
                <p className="font-medium text-[var(--app-text)]">{item.message}</p>
                {item.requestId && (
                    <span className="mt-1 flex items-center gap-1 text-[var(--app-text-muted)]">
                        Mã lỗi
                        <CopyButton
                            value={item.requestId}
                            label={item.requestId.slice(0, 8) + "…"}
                        />
                    </span>
                )}
            </div>
            <button
                type="button"
                aria-label={`Đóng thông báo: ${item.message}`}
                onClick={() => {
                    clearTimeout(timer.current);
                    setVisible(false);
                    setTimeout(() => removeToast(item.id), 200);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
