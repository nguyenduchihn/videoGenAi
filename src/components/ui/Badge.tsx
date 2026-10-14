import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
    | "default"
    | "neutral"
    | "accent"
    | "success"
    | "danger"
    | "warning"
    | "info";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

const NEUTRAL = "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)] border-[var(--app-border)]";

const styles: Record<BadgeVariant, string> = {
    default: NEUTRAL,
    neutral: NEUTRAL,
    accent:
        "bg-[var(--app-accent-soft)] text-[var(--app-accent)] border-transparent",
    success:
        "bg-[var(--app-success-soft)] text-[var(--app-success)] border-transparent",
    danger:
        "bg-[var(--app-danger-soft)] text-[var(--app-danger)] border-transparent",
    warning:
        "bg-[var(--app-warning-soft)] text-[var(--app-warning)] border-transparent",
    info:
        "bg-[var(--app-info-soft)] text-[var(--app-info)] border-transparent",
};

const dotColors: Record<BadgeVariant, string> = {
    default: "bg-[var(--app-text-muted)]",
    neutral: "bg-[var(--app-text-muted)]",
    accent:  "bg-[var(--app-accent)]",
    success: "bg-[var(--app-success)]",
    danger:  "bg-[var(--app-danger)]",
    warning: "bg-[var(--app-warning)]",
    info:    "bg-[var(--app-info)]",
};

export function Badge({ children, variant = "default", dot, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                styles[variant],
                className,
            )}
        >
            {dot && (
                <span
                    className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])}
                    aria-hidden
                />
            )}
            {children}
        </span>
    );
}
