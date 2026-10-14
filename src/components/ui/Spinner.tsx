import { cn } from "@/lib/cn";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
    xs: "h-3 w-3 border-[1.5px]",
    sm: "h-3.5 w-3.5 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label="Đang tải"
            className={cn(
                "inline-block animate-spin rounded-full",
                "border-[var(--app-border)] border-r-[var(--app-accent)]",
                sizes[size],
                className,
            )}
        />
    );
}
