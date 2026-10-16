import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { createTasks, enqueueRunItems, upsertRun } from "@/api/v1.api";
import { qk } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateTaskItem } from "@/types/api";
import { MAX_TASKS_PER_REQUEST } from "../generator/modes";
import { deleteManifest, isChunkOpen, listManifests, loadManifest, planChunks, remainingJobs, saveManifest, type RunManifest } from "./runManifest";
import { sendChunks } from "./sendChunks";

export interface SubmitMeta {
    name: string | null;
    ratio: string;
    onImageNotFound?: (imageId: string) => Promise<CreateTaskItem[] | null>;
}

export interface SubmitProgress {
    runId: string;
    /** Job đã tới máy chủ (gửi thẳng hoặc xếp hàng). */
    sent: number;
    total: number;
    /** Chunk lỗi chắc chắn ⇒ lý do, người dùng sửa rồi "Gửi tiếp". */
    error: string | null;
}

export interface PendingResume {
    runId: string;
    name: string | null;
    remaining: number;
    total: number;
    createdAt: string;
    error: string | null;
}

const toProgress = (m: RunManifest): SubmitProgress => ({
    runId: m.runId,
    sent: m.jobs.length - remainingJobs(m),
    total: m.jobs.length,
    error: m.chunks.find((c) => c.state === "failed")?.error ?? null,
});

const toPending = (m: RunManifest): PendingResume => ({
    runId: m.runId,
    name: m.name,
    remaining: remainingJobs(m),
    total: m.jobs.length,
    createdAt: m.createdAt,
    error: m.chunks.find((c) => c.state === "failed")?.error ?? null,
});

/**
 * Gửi một lượt: PUT /v1/runs/:id rồi các chunk ≤ 20 task; bản kê lưu IndexedDB để mở lại tab gửi tiếp.
 * Máy chủ là nguồn sự thật về tiến độ — hook này chỉ lo pha gửi.
 */
export function useRunSubmitter() {
    const userId = useAuthStore((s) => s.user?.user.id ?? "");
    const queryClient = useQueryClient();
    const [progress, setProgress] = useState<SubmitProgress | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const manifests = useQuery({
        queryKey: qk.runManifests(userId),
        queryFn: () => listManifests(userId),
        enabled: userId !== "",
        select: (list) => list.filter((m) => remainingJobs(m) > 0).map(toPending),
    });
    const pendingResume = manifests.data ?? [];
    const refreshPending = useCallback(() => queryClient.invalidateQueries({ queryKey: qk.runManifests(userId) }), [queryClient, userId]);

    const run = useCallback(async (manifest: RunManifest, meta: Pick<SubmitMeta, "onImageNotFound">): Promise<RunManifest> => {
        setIsSubmitting(true);
        setProgress(toProgress(manifest));
        try {
            const result = await sendChunks(manifest, {
                createTasks,
                enqueueRunItems,
                onImageNotFound: meta.onImageNotFound,
                save: saveManifest,
                onProgress: (m) => setProgress(toProgress(m)),
            });
            if (!result.chunks.some(isChunkOpen)) await deleteManifest(userId, result.runId);
            setProgress(toProgress(result));
            return result;
        } finally {
            setIsSubmitting(false);
            void queryClient.invalidateQueries({ queryKey: qk.runs() });
            void queryClient.invalidateQueries({ queryKey: qk.run(manifest.runId) });
            void refreshPending();
        }
    }, [queryClient, refreshPending, userId]);

    const submit = useCallback(async (jobs: string[], tasks: CreateTaskItem[], meta: SubmitMeta): Promise<{ runId: string }> => {
        const runId = crypto.randomUUID();
        await upsertRun(runId, { name: meta.name, totalPlanned: jobs.length });
        const manifest: RunManifest = {
            runId, userId, name: meta.name, createdAt: new Date().toISOString(), ratio: meta.ratio, jobs, tasks,
            chunks: planChunks(jobs.length, MAX_TASKS_PER_REQUEST),
        };
        await saveManifest(manifest);
        await run(manifest, meta);
        return { runId };
    }, [run, userId]);

    const resume = useCallback(async (runId: string): Promise<void> => {
        const manifest = await loadManifest(userId, runId);
        if (!manifest) return;
        await run(manifest, {});
    }, [run, userId]);

    const discard = useCallback(async (runId: string): Promise<void> => {
        await deleteManifest(userId, runId);
        await refreshPending();
    }, [refreshPending, userId]);

    return { submit, resume, discard, progress, isSubmitting, pendingResume };
}
