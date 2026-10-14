import { useFeedbackStore } from "@/stores/feedback.store";
import { Toast } from "./Toast";

export function ToastStack() {
    const toasts = useFeedbackStore((s) => s.toasts);
    if (!toasts.length) return null;
    return (
        <div
            role="log"
            aria-live="polite"
            aria-label="Thông báo"
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-[9500] flex flex-col gap-2 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[340px]"
        >
            {toasts.map((t) => (
                <Toast key={t.id} item={t} />
            ))}
        </div>
    );
}
