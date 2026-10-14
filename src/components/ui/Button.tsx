import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "ghost"
    | "link";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary:
        "bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)] focus-visible:ring-[var(--app-accent)]/40 disabled:bg-[var(--app-text-muted)]",
    secondary:
        "bg-[var(--app-surface-soft)] text-[var(--app-text)] hover:bg-[var(--app-border)]",
    outline:
        "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]",
    danger:
        "bg-[var(--app-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--app-danger)]/40 disabled:bg-[var(--app-text-muted)]",
    ghost:
        "bg-transparent text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]",
    link:
        "h-auto bg-transparent px-0 text-[var(--app-accent)] underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
    sm: "h-8 rounded-lg px-3 text-xs",
    md: "h-9 rounded-lg px-4 text-sm",
    lg: "h-11 rounded-xl px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        {
            children,
            variant = "primary",
            size = "md",
            loading = false,
            fullWidth = false,
            disabled,
            className,
            ...props
        },
        ref,
    ) {
        return (
            <button
                ref={ref}
                type="button"
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium transition",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    sizes[size],
                    variants[variant],
                    fullWidth && "w-full",
                    className,
                )}
                {...props}
            >
                {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                )}
                {children}
            </button>
        );
    },
);
