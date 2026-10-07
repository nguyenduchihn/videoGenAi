import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    width = "md",
}: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div
                className={[
                    "relative flex max-h-[90vh] w-full flex-col",
                    "overflow-hidden rounded-2xl border border-gray-200",
                    "bg-white shadow-2xl",
                    widthClasses[width],
                ].join(" ")}
            >
                {(title || description) && (
                    <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
                        <div className="min-w-0 pr-4">
                            {title && (
                                <h2 className="text-base font-semibold text-gray-950">
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p className="mt-1 text-sm leading-5 text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Đóng"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>

                {footer && (
                    <div className="shrink-0 border-t border-gray-100 px-5 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}