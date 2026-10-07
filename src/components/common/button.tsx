import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-300",
    secondary:
        "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100",
    outline:
        "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50",
    danger:
        "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-8 rounded-lg px-3 text-xs",
    md: "h-9 rounded-lg px-4 text-sm",
    lg: "h-11 rounded-xl px-5 text-sm",
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}: ButtonProps) {
    return (
        <button
            type="button"
            disabled={disabled || loading}
            className={[
                "inline-flex items-center justify-center gap-2",
                "font-medium transition",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                "disabled:cursor-not-allowed disabled:opacity-70",
                sizeClasses[size],
                variantClasses[variant],
                fullWidth ? "w-full" : "",
                className,
            ].join(" ")}
            {...props}
        >
            {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            )}

            {children}
        </button>
    );
}