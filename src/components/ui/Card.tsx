import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
    flush?: boolean;
    /** Thẻ HTML bao ngoài: `section` khi khối có tiêu đề riêng (aria-labelledby). */
    as?: "div" | "section" | "article";
}

export function Card({ children, flush, className, as: Tag = "div", ...props }: CardProps) {
    return (
        <Tag
            className={cn(
                "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]",
                !flush && "p-5",
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}
