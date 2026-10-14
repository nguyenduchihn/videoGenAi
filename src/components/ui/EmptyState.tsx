import { Inbox } from "lucide-react";
import { isValidElement } from "react";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
    title: string;
    description?: string;
    /** Icon lucide (component) hoặc một phần tử đã render. */
    icon?: ElementType | ReactNode;
    action?: ReactNode;
    className?: string;
}

function renderIcon(icon: EmptyStateProps["icon"]): ReactNode {
    if (!icon) return <Inbox className="h-5 w-5" aria-hidden />;
    if (isValidElement(icon)) return icon;
    const Icon = icon as ElementType;
    return <Icon className="h-5 w-5" aria-hidden />;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center", className)}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-text-muted)] [&>svg]:h-5 [&>svg]:w-5">
                {renderIcon(icon)}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--app-text)]">{title}</h3>
            {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-[var(--app-text-secondary)]">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
