import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RunProgressHeader from "@/components/runs/RunProgressHeader";
import RunStatusTabs from "@/components/runs/RunStatusTabs";
import { tabToStatus, type RunTab, type RunViewMode } from "@/components/runs/runTabs";
import VirtualResultGrid from "@/components/runs/VirtualResultGrid";
import type { RunTaskActions } from "@/components/runs/runTaskView";
import { Spinner } from "@/components/ui";
import { useRunActions, useRunSummary, useRunTasks } from "@/features/runs/useRuns";
import { useFeedback } from "@/hooks/useFeedback";
import { getErrorMessage } from "@/lib/errors";
import { scrollToTop } from "@/lib/scroll";
import type { PortalTask } from "@/types/api";

const DOWNLOAD_BATCH = 10;
const ROWS_THRESHOLD = 50;
const TAB_LABEL: Record<RunTab, string> = { all: "Tất cả", active: "Đang chờ / tạo", succeeded: "Hoàn thành", failed: "Thất bại", cancelled: "Đã huỷ" };

export default function RunDetailPage() {
    const { runId = "" } = useParams<{ runId: string }>();
    const navigate = useNavigate();
    const { toast, confirm } = useFeedback();
    const [tab, setTab] = useState<RunTab>("all");
    const [viewOverride, setViewOverride] = useState<RunViewMode | null>(null);
    const summary = useRunSummary(runId);
    const run = summary.data;
    const tasksQuery = useRunTasks(runId, tabToStatus(tab), run);
    const actions = useRunActions(runId);

    const tasks = useMemo(() => {
        const all = tasksQuery.data?.pages.flatMap((p) => p.tasks) ?? [];
        return tab === "active" ? all.filter((t) => t.status === "pending" || t.status === "processing") : all;
    }, [tab, tasksQuery.data]);
    const total = run ? Math.max(run.totalPlanned, run.created) : tasks.length;
    const viewMode: RunViewMode = viewOverride ?? (total > ROWS_THRESHOLD ? "rows" : "cards");

    const downloadMany = useCallback((list: PortalTask[]) => {
        const urls = list.filter((t) => t.status === "succeeded" && t.result?.url).map((t) => t.result!.url!);
        urls.slice(0, DOWNLOAD_BATCH).forEach((url) => window.open(url, "_blank", "noopener"));
        if (urls.length > DOWNLOAD_BATCH) toast.info(`Đã mở ${DOWNLOAD_BATCH}/${urls.length} file; cuộn xuống và bấm lại để mở tiếp. Trình duyệt có thể chặn pop-up.`);
        else if (urls.length === 0) toast.warning("Chưa có file nào đã hoàn thành trong danh sách đang hiển thị.");
    }, [toast]);

    const taskActions: RunTaskActions = useMemo(() => ({
        onRetry: (task) => actions.retryFailed.mutate([task.id], { onError: (e) => toast.error(getErrorMessage(e)) }),
        onCancel: (task) => actions.cancelOne.mutate(task.id, { onError: (e) => toast.error(getErrorMessage(e)) }),
        onDownload: (task) => { if (task.result?.url) window.open(task.result.url, "_blank", "noopener"); },
        onRefresh: () => void tasksQuery.refetch(),
    }), [actions.cancelOne, actions.retryFailed, navigate, tasksQuery, toast]);

    const cancelRemaining = async () => {
        if (!run) return;
        const ok = await confirm({ title: "Huỷ phần còn lại?", body: "Task đang chờ/đang tạo và job xếp hàng sẽ bị huỷ, credit hoàn lại. Task đã xong giữ nguyên.", confirmLabel: "Huỷ còn lại", danger: true });
        if (ok) actions.cancel.mutate(undefined, { onSuccess: (r) => toast.success(`Đã huỷ ${r.cancelled + r.queuedCancelled} job, hoàn ${r.creditsRefunded} credit.`), onError: (e) => toast.error(getErrorMessage(e)) });
    };

    if (summary.isLoading) {
        return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="md" /></div>;
    }
    if (summary.error || !run) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4">
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-[var(--app-danger)]" aria-hidden="true" />
                    <p className="mt-4 text-sm font-semibold text-[var(--app-text)]">Lượt tạo này không còn tồn tại.</p>
                    <button type="button" onClick={() => navigate("/runs")} className="mt-4 text-sm font-medium text-[var(--app-accent)] hover:underline">← Về danh sách lượt tạo</button>
                </div>
            </div>
        );
    }

    const filteredCount = tab === "all" ? total : tab === "active" ? run.counts.pending + run.counts.processing : run.counts[tab];
    const changeTab = (next: RunTab) => {
        setTab(next);
        scrollToTop(); // đang ở sâu 2.000 px mà chuyển sang mục 3 job ⇒ không nhìn thấy gì
    };

    return (
        <div className="min-h-[calc(100dvh-var(--app-header-h))] bg-[var(--app-bg)]">
            <RunProgressHeader
                run={run}
                sticky
                isBusy={actions.cancel.isPending || actions.retryFailed.isPending}
                onRename={(name) => actions.rename.mutate(name, { onError: (e) => toast.error(getErrorMessage(e)) })}
                onCancelRemaining={() => void cancelRemaining()}
                onRetryFailed={() => actions.retryFailed.mutate(undefined, { onSuccess: (r) => toast.success(`Đã xếp hàng lại ${r.created} job thất bại.`), onError: (e) => toast.error(getErrorMessage(e)) })}
                onDownloadAll={() => downloadMany(tasks)}
            />
            <RunStatusTabs counts={run.counts} total={total} value={tab} onChange={changeTab} viewMode={viewMode} onViewModeChange={setViewOverride} />
            {tasksQuery.isLoading ? (
                <div className="flex items-center justify-center py-16"><Spinner size="md" /></div>
            ) : (
                <VirtualResultGrid
                    label={`Job — ${TAB_LABEL[tab]}`}
                    tasks={tasks}
                    totalCount={filteredCount}
                    mode={viewMode}
                    actions={taskActions}
                    hasMore={tasksQuery.hasNextPage ?? false}
                    isFetchingMore={tasksQuery.isFetchingNextPage}
                    onFetchMore={() => void tasksQuery.fetchNextPage()}
                />
            )}
        </div>
    );
}
