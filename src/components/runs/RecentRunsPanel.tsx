import { Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useRunsQuery } from "@/features/runs/useRuns";
import { Skeleton } from "@/components/ui";
import RunCard from "./RunCard";

const LIMIT = 5;

/** Khối "Lượt tạo gần đây" ở Trang chủ (thay "Hoạt động gần đây"). */
export default function RecentRunsPanel() {
    const query = useRunsQuery(undefined, { limit: LIMIT });
    const runs = (query.data?.pages[0]?.runs ?? []).slice(0, LIMIT);
    const activeCount = runs.filter((r) => r.status === "active").length;
    return (
        <section className="flex min-w-0 flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors" aria-labelledby="recent-runs-title">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4">
                <div>
                    <h2 id="recent-runs-title" className="text-sm font-semibold text-[var(--app-text)]">Lượt tạo gần đây</h2>
                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">{activeCount > 0 ? `${activeCount} lượt đang chạy` : "Tiến độ được lưu trên máy chủ"}</p>
                </div>
                <Link to="/runs" className="text-xs font-medium text-[var(--app-accent)] transition hover:underline">Xem tất cả</Link>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
                {query.isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
                {!query.isLoading && runs.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]">
                            <Layers className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-[var(--app-text)]">Chưa có lượt tạo nào</p>
                        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">Nhập prompt và bấm Tạo để bắt đầu.</p>
                    </div>
                )}
                {runs.map((run) => <RunCard key={run.id} run={run} compact />)}
            </div>
        </section>
    );
}
