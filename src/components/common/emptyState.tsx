import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export default function EmptyState({
    title,
    description,
    icon,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                {icon ?? <Inbox className="h-5 w-5" />}
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                {title}
            </h3>

            {description && (
                <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-s00">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}