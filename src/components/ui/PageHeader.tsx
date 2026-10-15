import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
            <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--app-text)]">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
