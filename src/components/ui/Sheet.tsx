import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    side?: "right" | "left" | "bottom";
    className?: string;
}

const sideStyles: Record<NonNullable<SheetProps["side"]>, string> = {
    right:  "right-0 top-0 h-full w-full max-w-[420px] border-l translate-x-full data-[open=true]:translate-x-0",
    left:   "left-0 top-0 h-full w-full max-w-[420px] border-r -translate-x-full data-[open=true]:translate-x-0",
    bottom: "bottom-0 left-0 w-full rounded-t-2xl border-t translate-y-full data-[open=true]:translate-y-0",
};

export function Sheet({
    open,
    onClose,
    title,
    children,
    side = "right",
    className,
}: SheetProps) {
    const ref = useRef<HTMLDivElement>(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement as HTMLElement | null;
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            ref.current
                ?.querySelectorAll<HTMLElement>(
                    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
                )[0]
                ?.focus();
        }, 50);
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
            prev?.focus();
        };
    }, [open, onClose]);

    return createPortal(
        <div
            className={cn(
                "fixed inset-0 z-[9990] overflow-hidden transition-opacity duration-200",
                open
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
            <div
                ref={ref}
                data-open={open}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "absolute border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl",
                    "transition-transform duration-300 ease-out",
                    sideStyles[side],
                    className,
                )}
            >
                <div className="flex h-14 items-center justify-between border-b border-[var(--app-border)] px-5">
                    {title && (
                        <h2 id={titleId} className="text-sm font-semibold text-[var(--app-text)]">
                            {title}
                        </h2>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div
                    className="overflow-y-auto p-5"
                    style={{ maxHeight: "calc(100% - 56px)" }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}
