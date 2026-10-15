import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui";
import { useFeedbackStore } from "@/stores/feedback.store";

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function ConfirmDialog() {
    const confirm = useFeedbackStore((s) => s.confirm);
    const resolveConfirm = useFeedbackStore((s) => s.resolveConfirm);
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const id = useId();

    useEffect(() => {
        if (!confirm) return;
        const previous = document.activeElement as HTMLElement | null;
        cancelRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                resolveConfirm(false);
                return;
            }
            if (e.key !== "Tab") return;
            const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusable[0]!;
            const last = focusable[focusable.length - 1]!;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
            previous?.focus();
        };
    }, [confirm, resolveConfirm]);

    if (!confirm) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`${id}-title`}
                aria-describedby={confirm.body ? `${id}-body` : undefined}
                className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl"
            >
                <h2 id={`${id}-title`} className="text-base font-semibold text-[var(--app-text)]">
                    {confirm.title}
                </h2>
                {confirm.body && (
                    <p id={`${id}-body`} className="mt-2 text-sm text-[var(--app-text-secondary)]">
                        {confirm.body}
                    </p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                    <Button ref={cancelRef} variant="outline" size="sm" onClick={() => resolveConfirm(false)}>
                        {confirm.cancelLabel ?? "Huỷ"}
                    </Button>
                    <Button variant={confirm.danger ? "danger" : "primary"} size="sm" onClick={() => resolveConfirm(true)}>
                        {confirm.confirmLabel ?? "Xác nhận"}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
