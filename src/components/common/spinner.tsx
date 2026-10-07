interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "h-3.5 w-3.5 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]",
};

export default function Spinner({
    size = "md",
    className = "",
}: SpinnerProps) {
    return (
        <span
            className={[
                "inline-block animate-spin rounded-full border-gray-200 border-r-violet-600",
                sizeClasses[size],
                className,
            ].join(" ")}
            aria-label="Đang tải"
        />
    );
}