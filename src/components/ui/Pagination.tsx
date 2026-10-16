import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface PaginationProps {
    page: number;
    /** Số mục đang hiển thị ở trang này. */
    count: number;
    pageSize: number;
    hasPrev: boolean;
    hasNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    loading?: boolean;
    className?: string;
}

/** Phân trang theo cursor (không biết tổng số trang) ⇒ chỉ Trước/Sau + số trang hiện tại. */
export function Pagination({ page, count, pageSize, hasPrev, hasNext, onPrev, onNext, loading = false, className }: PaginationProps) {
    return (
        <nav aria-label="Phân trang" className={cn("flex items-center justify-between gap-3", className)}>
            <p className="text-xs text-[var(--app-text-muted)]" aria-live="polite">
                Trang {page} · {count}/{pageSize} mục
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev || loading} aria-label="Trang trước">
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                    Trước
                </Button>
                <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext || loading} loading={loading && hasNext} aria-label="Trang sau">
                    Sau
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
            </div>
        </nav>
    );
}
