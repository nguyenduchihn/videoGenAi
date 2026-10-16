import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
    className,
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const titleId = `${id}-title`;
    const descId = `${id}-desc`;
    // Giữ onClose trong ref: effect bẫy focus chỉ chạy lại khi mở/đóng, không chạy lại mỗi lần cha render
    // (callback inline mới mỗi render ⇒ trước đây focus bị kéo về nút đầu tiên sau mỗi phím gõ trong form).
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement as HTMLElement | null;
        const getFocusable = () =>
            Array.from(
                dialogRef.current?.querySelectorAll<HTMLElement>(
                    'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
                ) ?? [],
            );

        getFocusable()[0]?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { onCloseRef.current(); return; }
            if (e.key !== "Tab") return;
            const els = getFocusable();
            if (!els.length) return;
            const first = els[0], last = els[els.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        };

        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
            prev?.focus();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div
                ref={dialogRef}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "relative z-10 w-full rounded-2xl border border-[var(--app-border)]",
                    "bg-[var(--app-surface)] shadow-2xl",
                    sizes[size],
                    className,
                )}
            >
                {(title || description) && (
                    <div className="border-b border-[var(--app-border)] px-6 py-4 pr-14">
                        {title && (
                            <h2
                                id={titleId}
                                className="text-base font-semibold text-[var(--app-text)]"
                            >
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p
                                id={descId}
                                className="mt-0.5 text-sm text-[var(--app-text-secondary)]"
                            >
                                {description}
                            </p>
                        )}
                    </div>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Đóng"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                >
                    <X className="h-4 w-4" />
                </button>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
