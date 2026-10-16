import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DataList, ErrorPanel, PageHeader, Pagination, StatusBadge, Button } from "@/components/ui";
import { TASKS_PAGE_SIZE, useTasksHistory } from "@/hooks/useTasksHistory";
import { getErrorMessage } from "@/lib/errors";
import { formatCredits, formatRelativeTime } from "@/lib/format";
import { scrollToTop } from "@/lib/scroll";
import type { PortalTask, TaskStatus } from "@/types/api";
import { emptyTrail, nextPageState, prevPageState, readPageState, rememberCursor, withPageState, type CursorTrail, type TaskPageState } from "./taskPaging";
import { workerLabel, workerIcon } from "./workerLabels";
import TaskDetailSheet from "./TaskDetailSheet";

const FILTERS: { label: string; value: string }[] = [
    { label: "Tất cả", value: "" },
    { label: "Đang chờ", value: "pending" },
    { label: "Đang xử lý", value: "processing" },
    { label: "Hoàn thành", value: "succeeded" },
    { label: "Thất bại", value: "failed" },
    { label: "Đã huỷ", value: "cancelled" },
];

export default function TasksPage() {
    const [params, setParams] = useSearchParams();
    const status = (params.get("status") || undefined) as TaskStatus | undefined;
    const detailId = params.get("id");
    const pageState = readPageState(params);
    // Vết cursor theo bộ lọc hiện tại: đổi bộ lọc ⇒ danh sách khác ⇒ vết cũ vô nghĩa
    const [trail, setTrail] = useState<{ status?: TaskStatus; map: CursorTrail }>({ status, map: emptyTrail() });
    const trailMap = trail.status === status ? trail.map : emptyTrail();
    useEffect(() => {
        setTrail((cur) => (cur.status === status ? { status, map: rememberCursor(cur.map, pageState) } : { status, map: rememberCursor(emptyTrail(), pageState) }));
    }, [status, pageState.page, pageState.cursor]); // eslint-disable-line react-hooks/exhaustive-deps

    const setStatus = (v: string) =>
        setParams((p) => {
            const n = withPageState(p, { page: 1 }); // đổi bộ lọc ⇒ về trang 1
            if (v) n.set("status", v);
            else n.delete("status");
            return n;
        });

    const setDetail = (id: string | null) =>
        setParams((p) => {
            const n = new URLSearchParams(p);
            if (id) n.set("id", id);
            else n.delete("id");
            return n;
        });

    const goTo = (next: TaskPageState) => {
        setParams((p) => withPageState(p, next));
        scrollToTop();
    };

    const { data, isLoading, isFetching, error, refetch } = useTasksHistory({ status, cursor: pageState.cursor });
    const tasks = data?.tasks ?? [];
    const nextCursor = data?.nextCursor ?? null;
    const hasPrev = pageState.page > 1;
    const hasNext = Boolean(nextCursor);

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <PageHeader
                title="Lịch sử tác vụ"
                description={`Xem lại toàn bộ tác vụ đã tạo, mới nhất trước · ${TASKS_PAGE_SIZE} mục mỗi trang.`}
                className="mb-5"
            />
            <div role="tablist" aria-label="Lọc theo trạng thái" className="mb-5 flex flex-wrap gap-2">
                {FILTERS.map(({ label, value }) => {
                    const active = (params.get("status") ?? "") === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-pressed={active}
                            aria-selected={active}
                            onClick={() => setStatus(value)}
                            className={[
                                "h-8 rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2",
                                active
                                    ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white"
                                    : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
            {error ? (
                <ErrorPanel message={getErrorMessage(error)} onRetry={() => void refetch()} />
            ) : (
                <div aria-busy={isFetching} className={isFetching && !isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                    <DataList
                        items={tasks}
                        loading={isLoading}
                        skeletonCount={6}
                        emptyTitle={pageState.page > 1 ? "Trang này không còn tác vụ" : "Chưa có tác vụ nào"}
                        emptyDescription={pageState.page > 1 ? "Quay về trang 1 để xem danh sách." : "Tạo tác vụ đầu tiên từ trang chủ."}
                        renderItem={(task: PortalTask) => (
                            <TaskRow key={task.id} task={task} onDetail={() => setDetail(task.id)} />
                        )}
                    />
                    {!isLoading && (hasPrev || hasNext) && (
                        <Pagination
                            className="mt-5"
                            page={pageState.page}
                            count={tasks.length}
                            pageSize={TASKS_PAGE_SIZE}
                            hasPrev={hasPrev}
                            hasNext={hasNext}
                            loading={isFetching}
                            onPrev={() => goTo(prevPageState(pageState, trailMap))}
                            onNext={() => { if (nextCursor) goTo(nextPageState(pageState, nextCursor)); }}
                        />
                    )}
                </div>
            )}
            <TaskDetailSheet id={detailId} onClose={() => setDetail(null)} />
        </div>
    );
}

function TaskRow({ task, onDetail }: { task: PortalTask; onDetail: () => void }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3.5 transition hover:bg-[var(--app-surface-soft)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]">
                {workerIcon(task.worker)}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--app-text)]">{workerLabel(task.worker)}</p>
                    <StatusBadge status={task.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-[var(--app-text-muted)]">
                    {task.model ?? "Default model"} · {formatCredits(task.priceCredits)} · {formatRelativeTime(task.createdAt)}
                </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onDetail}>Chi tiết</Button>
        </div>
    );
}
