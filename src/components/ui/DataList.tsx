import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { ErrorPanel } from "./ErrorPanel";
import { Button } from "./Button";

interface DataListProps<T> {
    items: T[];
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    renderItem: (item: T, index: number) => ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    skeletonCount?: number;
    loadMore?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
    className?: string;
}

export function DataList<T>({
    items,
    loading,
    error,
    onRetry,
    renderItem,
    emptyTitle = "Không có dữ liệu",
    emptyDescription,
    skeletonCount = 4,
    loadMore,
    hasMore,
    loadingMore,
    className,
}: DataListProps<T>) {
    if (loading) {
        return (
            <div className={cn("space-y-3", className)}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <ErrorPanel message={error} onRetry={onRetry} className={className} />
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={Inbox}
                className={className}
            />
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {items.map((item, i) => renderItem(item, i))}
            {hasMore && (
                <div className="pt-2 text-center">
                    <Button
                        variant="outline"
                        size="sm"
                        loading={loadingMore}
                        onClick={loadMore}
                    >
                        Tải thêm
                    </Button>
                </div>
            )}
        </div>
    );
}
