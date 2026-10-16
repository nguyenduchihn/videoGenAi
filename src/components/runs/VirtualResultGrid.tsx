import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PortalTask } from "@/types/api";
import RunTaskCard from "./RunTaskCard";
import RunTaskRow from "./RunTaskRow";
import type { RunViewMode } from "./runTabs";
import { columnsFor, type RunTaskActions } from "./runTaskView";

interface VirtualResultGridProps {
    /** Tên lưới cho trình đọc màn hình, vd "Job — Thất bại". */
    label: string;
    tasks: PortalTask[];
    /** Số job của mục đang lọc (aria-rowcount), không phải tổng cả lượt. */
    totalCount: number;
    mode: RunViewMode;
    ratio?: string;
    actions: RunTaskActions;
    hasMore: boolean;
    isFetchingMore: boolean;
    onFetchMore: () => void;
}

const CARD_ROW_PX = 360;
const COMPACT_ROW_PX = 57;
const GAP_PX = 16;

/**
 * Lưới ảo hoá theo HÀNG trên cuộn trang: chỉ ~2 màn hình DOM dù lượt có 1.000 job; mỗi hàng = `columns` thẻ (hoặc 1 hàng gọn).
 * Cuộn gần cuối ⇒ tải trang kế (useInfiniteQuery).
 */
export default function VirtualResultGrid({ label, tasks, totalCount, mode, ratio, actions, hasMore, isFetchingMore, onFetchMore }: VirtualResultGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [scrollMargin, setScrollMargin] = useState(0);
    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node || typeof ResizeObserver === "undefined") return;
        // offsetTop đo sau khi gắn DOM (header dính + tab chiếm ~150 px) ⇒ hàng ảo không bị lệch ở lần vẽ đầu
        const measure = () => {
            setWidth(node.getBoundingClientRect().width);
            setScrollMargin(node.offsetTop);
        };
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        measure();
        return () => observer.disconnect();
    }, []);

    const columns = columnsFor(width || 1024, mode);
    const rowCount = Math.ceil(tasks.length / columns);
    const virtualizer = useWindowVirtualizer({
        count: rowCount,
        estimateSize: () => (mode === "cards" ? CARD_ROW_PX + GAP_PX : COMPACT_ROW_PX),
        overscan: mode === "cards" ? 2 : 10,
        scrollMargin,
    });

    const items = virtualizer.getVirtualItems();
    const lastRow = items.at(-1)?.index ?? -1;
    useEffect(() => {
        if (hasMore && !isFetchingMore && lastRow >= rowCount - 2) onFetchMore();
    }, [hasMore, isFetchingMore, lastRow, onFetchMore, rowCount]);

    if (tasks.length === 0) {
        return <p className="px-4 py-12 text-center text-sm text-[var(--app-text-muted)] sm:px-5">Không có job nào ở mục này.</p>;
    }

    return (
        <div ref={containerRef} role="grid" aria-label={label} aria-rowcount={Math.ceil(totalCount / columns)} aria-busy={isFetchingMore} className="px-4 sm:px-5">
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {items.map((row) => {
                    const slice = tasks.slice(row.index * columns, (row.index + 1) * columns);
                    return (
                        <div
                            key={row.key}
                            role="presentation"
                            data-index={row.index}
                            ref={virtualizer.measureElement}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
                        >
                            {mode === "cards" ? (
                                <div role="row" aria-rowindex={row.index + 1} className="grid gap-4 pb-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                                    {slice.map((task) => (
                                        <div key={task.id} role="gridcell"><RunTaskCard task={task} ratio={ratio} actions={actions} /></div>
                                    ))}
                                </div>
                            ) : (
                                slice.map((task) => <RunTaskRow key={task.id} task={task} actions={actions} rowIndex={row.index + 1} />)
                            )}
                        </div>
                    );
                })}
            </div>
            {isFetchingMore && (
                <div className="flex items-center justify-center py-6 text-[var(--app-text-muted)]">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden="true" />
                </div>
            )}
        </div>
    );
}
