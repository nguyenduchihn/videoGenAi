import { isValidElement } from "react";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface StatCardProps {
    label: string;
    value: ReactNode;
    /** Icon lucide (component) hoặc phần tử đã render. */
    icon?: ElementType | ReactNode;
    /** Dòng phụ dưới giá trị (mô tả, link hành động…). */
    description?: ReactNode;
    delta?: string;
    deltaPositive?: boolean;
    className?: string;
}

function renderIcon(icon: StatCardProps["icon"]): ReactNode {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    const Icon = icon as ElementType;
    return <Icon className="h-4 w-4" aria-hidden />;
}

export function StatCard({ label, value, icon, description, delta, deltaPositive, className }: StatCardProps) {
    return (
        <div className={cn("rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5", className)}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-text-muted)]">{label}</p>
                {icon && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)] [&>svg]:h-4 [&>svg]:w-4">
                        {renderIcon(icon)}
                    </div>
                )}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--app-text)]">{value}</p>
            {description && <div className="mt-1 text-xs text-[var(--app-text-secondary)]">{description}</div>}
            {delta && (
                <p className={cn("mt-1 text-xs", deltaPositive ? "text-[var(--app-success)]" : "text-[var(--app-danger)]")}>{delta}</p>
            )}
        </div>
    );
}
