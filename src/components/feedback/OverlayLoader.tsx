import { Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui";

interface OverlayLoaderProps {
    message?: string;
    blocking?: boolean;
}

export function OverlayLoader({ message = "Đang tải…", blocking }: OverlayLoaderProps) {
    if (!blocking) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="fixed bottom-20 left-1/2 z-[9000] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 shadow-lg sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0"
            >
                <Spinner size="sm" />
                <span className="text-xs text-[var(--app-text-secondary)]">{message}</span>
            </div>
        );
    }
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            <div className="w-[280px] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-2xl">
                <div className="relative mx-auto mb-5 h-14 w-14">
                    <div className="absolute inset-0 animate-ping rounded-xl bg-[var(--app-accent-soft)] motion-reduce:animate-none motion-reduce:opacity-50" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--app-accent-soft)]">
                        <Sparkles className="h-6 w-6 text-[var(--app-accent)]" aria-hidden />
                    </div>
                </div>
                <Spinner size="md" className="mx-auto mb-3" />
                <p className="text-sm text-[var(--app-text-secondary)]">{message}</p>
            </div>
        </div>
    );
}
