import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/cn";

import { CopyButton } from "./CopyButton";

interface ErrorPanelProps {
    title?: string;
    message: string;
    /** Mã yêu cầu từ backend để người dùng gửi cho hỗ trợ. */
    requestId?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorPanel({ title, message, requestId, onRetry, className }: ErrorPanelProps) {
    return (
        <div
            role="alert"
            className={cn("flex items-start gap-3 rounded-xl border border-[var(--app-danger)]/20 bg-[var(--app-danger-soft)] px-4 py-3", className)}
        >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-danger)]" aria-hidden />
            <div className="min-w-0 flex-1">
                {title && <p className="text-sm font-semibold text-[var(--app-danger)]">{title}</p>}
                <p className={cn("text-sm text-[var(--app-danger)]", title && "mt-0.5 opacity-90")}>{message}</p>
                {requestId && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--app-danger)]/80">
                        <span className="font-mono">Mã lỗi: {requestId}</span>
                        <CopyButton value={requestId} label="Sao chép mã lỗi" />
                    </div>
                )}
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-1.5 text-xs font-medium text-[var(--app-danger)] underline underline-offset-2 hover:no-underline"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
}
