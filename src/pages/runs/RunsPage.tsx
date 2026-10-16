import { Layers } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import RunCard from "@/components/runs/RunCard";
import { nextTabIndex } from "@/components/runs/rovingTabs";
import { Button, EmptyState, ErrorPanel, PageHeader, Skeleton } from "@/components/ui";
import { useRunsQuery } from "@/features/runs/useRuns";
import { getErrorMessage } from "@/lib/errors";
import type { RunStatus } from "@/types/api";

const FILTERS: Array<{ value: RunStatus | "all"; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang chạy" },
    { value: "done", label: "Hoàn tất" },
    { value: "cancelled", label: "Đã huỷ" },
];

export default function RunsPage() {
    const [filter, setFilter] = useState<RunStatus | "all">("all");
    const query = useRunsQuery(filter === "all" ? undefined : filter);
    const runs = query.data?.pages.flatMap((p) => p.runs) ?? [];
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const next = nextTabIndex(event.key, index, FILTERS.length);
        if (next === null) return;
        event.preventDefault();
        setFilter(FILTERS[next]!.value);
        tabRefs.current[next]?.focus();
    };
    return (
        <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-7">
            <PageHeader title="Lượt tạo" description="Mỗi lần bấm Tạo là một lượt. Tiến độ lưu trên máy chủ — đóng tab hay đổi máy vẫn theo dõi được." className="mb-5" />
            <div role="tablist" aria-label="Lọc lượt tạo" className="mb-5 flex flex-wrap gap-2">
                {FILTERS.map((f, index) => {
                    const active = filter === f.value;
                    return (
                        <button key={f.value} ref={(el) => { tabRefs.current[index] = el; }} type="button" role="tab" aria-selected={active} tabIndex={active ? 0 : -1} onKeyDown={(event) => handleKeyDown(event, index)} onClick={() => setFilter(f.value)} className={`h-8 rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface)] ${active ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white" : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"}`}>
                            {f.label}
                        </button>
                    );
                })}
            </div>
            {query.error ? (
                <ErrorPanel message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />
            ) : query.isLoading ? (
                <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : runs.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title={filter === "all" ? "Chưa có lượt tạo nào" : "Không có lượt nào ở mục này"}
                    description="Tạo lượt đầu tiên từ Trang chủ: nhập prompt (mỗi dòng một job) rồi bấm Tạo."
                    action={<Link to="/dashboard"><Button>Bắt đầu tạo →</Button></Link>}
                />
            ) : (
                <div className="space-y-3">
                    {runs.map((run) => <RunCard key={run.id} run={run} />)}
                    {query.hasNextPage && (
                        <div className="flex justify-center pt-2">
                            <Button variant="secondary" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                                {query.isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
