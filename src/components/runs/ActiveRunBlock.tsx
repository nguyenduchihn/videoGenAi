import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRunSummary, useRunTasks } from "@/features/runs/useRuns";
import type { PortalTask } from "@/types/api";
import RunProgressHeader from "./RunProgressHeader";
import RunTaskCard from "./RunTaskCard";
import type { RunTaskActions } from "./runTaskView";

interface ActiveRunBlockProps {
    runId: string;
    /** Job còn chờ gửi ở client (bản kê). */
    remainingLocal: number;
    ratio?: string;
    actions: RunTaskActions;
    onCancelRemaining: () => void;
    onRetryFailed: () => void;
}

const PREVIEW_LIMIT = 20;

/** Dưới trình tạo ở Trang chủ: tiến độ lượt vừa gửi + 20 job đầu; mở trang lượt để xem đủ. */
export default function ActiveRunBlock({ runId, remainingLocal, ratio, actions, onCancelRemaining, onRetryFailed }: ActiveRunBlockProps) {
    const summary = useRunSummary(runId);
    const tasks = useRunTasks(runId, undefined, summary.data);
    const run = summary.data;
    if (!run) return null;
    const preview: PortalTask[] = (tasks.data?.pages.flatMap((p) => p.tasks) ?? []).slice(0, PREVIEW_LIMIT);
    return (
        <section className="mt-0 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]" aria-labelledby="active-run-title">
            <h2 id="active-run-title" className="sr-only">Lượt đang chạy</h2>
            <RunProgressHeader run={run} remainingLocal={remainingLocal} compact onCancelRemaining={onCancelRemaining} onRetryFailed={onRetryFailed} />
            <div role="region" aria-label="Kết quả" className="p-4 sm:p-5">
                {preview.length === 0 ? (
                    <p className="text-sm text-[var(--app-text-muted)]">Đang gửi job lên máy chủ…</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {preview.map((task) => <RunTaskCard key={task.id} task={task} ratio={ratio} actions={actions} />)}
                    </div>
                )}
                {(run.created > PREVIEW_LIMIT || run.queuedOnServer > 0 || remainingLocal > 0) && (
                    <Link to={`/runs/${runId}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--app-accent)] hover:underline">
                        Mở lượt tạo đầy đủ ({Math.max(run.totalPlanned, run.created).toLocaleString("vi-VN")} job) <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                )}
            </div>
        </section>
    );
}
