import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { cancelRun, cancelTask, getRun, listRuns, listRunTasks, renameRun, retryFailedRun } from "@/api/v1.api";
import { qk } from "@/lib/queryClient";
import type { RunStatus, RunSummary, TaskStatus } from "@/types/api";
import { pollIntervalFor } from "./runCopy";

const RUNS_REFRESH_MS = 15_000;

/** Tóm tắt một lượt: poll theo quy mô (3/10/20 s), tự dừng khi tab ẩn (refetchIntervalInBackground=false) và khi lượt kết thúc. */
export function useRunSummary(runId: string | null) {
    return useQuery({
        queryKey: qk.run(runId ?? ""),
        queryFn: () => getRun(runId!),
        enabled: Boolean(runId),
        staleTime: 1_000,
        refetchInterval: (query) => {
            const run = query.state.data;
            if (!run || run.status !== "active") return false;
            return pollIntervalFor(run.counts.pending + run.counts.processing + run.queuedOnServer);
        },
        refetchIntervalInBackground: false,
    });
}

/** Task của lượt theo runIndex, phân trang 100; làm mới các trang đã tải mỗi khi lượt có hoạt động mới. */
export function useRunTasks(runId: string | null, status?: TaskStatus, run?: RunSummary) {
    const queryClient = useQueryClient();
    const query = useInfiniteQuery({
        queryKey: qk.runTasks(runId ?? "", status),
        queryFn: ({ pageParam }) => listRunTasks(runId!, { status, cursor: pageParam as string | undefined, limit: 100 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: Boolean(runId),
    });
    const lastActivity = useRef<string | null>(null);
    useEffect(() => {
        if (!run || !runId) return;
        if (lastActivity.current !== null && lastActivity.current !== run.lastActivityAt) {
            void queryClient.invalidateQueries({ queryKey: qk.runTasks(runId, status) });
        }
        lastActivity.current = run.lastActivityAt;
    }, [queryClient, run, runId, status]);
    return query;
}

export function useRunsQuery(status?: RunStatus, options: { enabled?: boolean; limit?: number } = {}) {
    return useInfiniteQuery({
        queryKey: qk.runs(status),
        queryFn: ({ pageParam }) => listRuns({ status, cursor: pageParam as string | undefined, limit: options.limit ?? 20 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: options.enabled ?? true,
        refetchInterval: (query) => (query.state.data?.pages.some((p) => p.runs.some((r) => r.status === "active")) ? RUNS_REFRESH_MS : false),
        refetchIntervalInBackground: false,
    });
}

export function useRunActions(runId: string) {
    const queryClient = useQueryClient();
    const invalidate = () => {
        void queryClient.invalidateQueries({ queryKey: qk.run(runId) });
        void queryClient.invalidateQueries({ queryKey: qk.runTasks(runId) });
        void queryClient.invalidateQueries({ queryKey: qk.runs() });
    };
    const cancel = useMutation({ mutationFn: () => cancelRun(runId), onSuccess: invalidate });
    const rename = useMutation({ mutationFn: (name: string | null) => renameRun(runId, name), onSuccess: invalidate });
    const retryFailed = useMutation({ mutationFn: (taskIds?: string[]) => retryFailedRun(runId, taskIds), onSuccess: invalidate });
    const cancelOne = useMutation({ mutationFn: (taskId: string) => cancelTask(taskId), onSuccess: invalidate });
    return { cancel, rename, retryFailed, cancelOne };
}
