import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ActiveRunBlock from "@/components/runs/ActiveRunBlock";
import ConfirmGenerateDialog from "@/components/runs/ConfirmGenerateDialog";
import DraftRestoreBanner from "@/components/runs/DraftRestoreBanner";
import ResumeBanner from "@/components/runs/ResumeBanner";
import RunBanner from "@/components/runs/RunBanner";
import type { RunTaskActions } from "@/components/runs/runTaskView";
import { buildTasks } from "@/features/generator/buildTasks";
import { describeApiError } from "@/features/generator/errorCopy";
import { forgetImageId, uploadAttachments, type UploadProgress } from "@/features/generator/uploadAttachments";
import { useAutoDraft } from "@/features/generator/useAutoDraft";
import { useGeneratorForm } from "@/features/generator/useGeneratorForm";
import { runAutoName } from "@/features/runs/runCopy";
import { scrollToTop } from "@/lib/scroll";
import { useRunActions } from "@/features/runs/useRuns";
import { useRunSubmitter } from "@/features/runs/useRunSubmitter";
import { VIDEO_WORKERS, workerLabel } from "@/features/tasks/workerLabels";
import { useFeedback } from "@/hooks/useFeedback";
import { useTasksHistory } from "@/hooks/useTasksHistory";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateTaskItem, PortalTask } from "@/types/api";
import GeneratorSettings from "./generatorSettings";
import DefaultGenerator from "./layouts/defaultGenerator";
import type { SessionVideo } from "./sourceVideoPicker";

const CONFIRM_THRESHOLD = 20;

/** Khối hành động của lượt đang hiện ở Trang chủ (huỷ/thử lại/hủy từng task). */
function ActiveRunSection({ runId, remainingLocal, ratio, onExtend }: { runId: string; remainingLocal: number; ratio: string; onExtend: (task: PortalTask) => void }) {
    const { toast, confirm } = useFeedback();
    const actions = useRunActions(runId);
    const taskActions: RunTaskActions = useMemo(() => ({
        onRetry: (task) => actions.retryFailed.mutate([task.id], { onError: (e) => toast.error(getErrorMessage(e)) }),
        onCancel: (task) => actions.cancelOne.mutate(task.id, { onError: (e) => toast.error(getErrorMessage(e)) }),
        onDownload: (task) => { if (task.result?.url) window.open(task.result.url, "_blank", "noopener"); else toast.warning(`Job #${(task.runIndex ?? 0) + 1} chưa có file kết quả để tải.`); },
        onExtend,
    }), [actions.cancelOne, actions.retryFailed, onExtend, toast]);
    const cancelRemaining = async () => {
        if (await confirm({ title: "Huỷ phần còn lại?", body: "Task đang chờ/đang tạo và job xếp hàng sẽ bị huỷ, credit hoàn lại.", confirmLabel: "Huỷ còn lại", danger: true })) {
            actions.cancel.mutate(undefined, { onError: (e) => toast.error(getErrorMessage(e)) });
        }
    };
    return (
        <ActiveRunBlock
            runId={runId}
            remainingLocal={remainingLocal}
            ratio={ratio}
            actions={taskActions}
            onCancelRemaining={() => void cancelRemaining()}
            onRetryFailed={() => actions.retryFailed.mutate(undefined, { onError: (e) => toast.error(getErrorMessage(e)) })}
        />
    );
}

export default function GeneratorPanel() {
    const form = useGeneratorForm();
    const submitter = useRunSubmitter();
    const userId = useAuthStore((s) => s.user?.user.id ?? "");
    const [searchParams, setSearchParams] = useSearchParams();
    const history = useTasksHistory({ status: "succeeded" }, { enabled: form.mode === "extend-video" }); // 30 video gần nhất đủ cho danh sách "tiếp tục video"
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const draftSnapshot = useMemo(() => ({ prompt: form.prompt, mode: form.mode, ratio: form.aspectRatio, settings: form.settings }), [form.aspectRatio, form.mode, form.prompt, form.settings]);
    const draft = useAutoDraft(userId, draftSnapshot, form.applyDraft);

    // "Tiếp tục video" từ trang lượt tạo: /dashboard?extend=<mediaId>&label=…
    useEffect(() => {
        const mediaId = searchParams.get("extend");
        if (!mediaId) return;
        form.startExtendFrom(mediaId, searchParams.get("label") ?? `mediaId ${mediaId.slice(0, 8)}…`);
        setSearchParams({}, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi query đổi
    }, [searchParams]);

    const sessionVideos = useMemo<SessionVideo[]>(() => (history.data?.tasks ?? [])
        .filter((task) => VIDEO_WORKERS.has(task.worker) && task.result?.mediaId)
        .map((task): SessionVideo => ({ mediaId: task.result!.mediaId, label: `${workerLabel(task.worker)}${task.prompt ? ` · ${task.prompt.slice(0, 40)}` : ""}`, url: task.result?.url ?? undefined, createdAt: task.createdAt, source: "history" })), [history.data]);

    const prepareTasks = useCallback(async (jobs: string[]): Promise<CreateTaskItem[]> => {
        const resolved = await uploadAttachments(form.attachments, form.uploadCache, { onProgress: setUploadProgress });
        return buildTasks(form.mode, jobs, form.settings, form.aspectRatio, resolved);
    }, [form.attachments, form.uploadCache, form.mode, form.settings, form.aspectRatio]);

    const reuploadFor = useCallback((jobs: string[]) => async (imageId: string): Promise<CreateTaskItem[] | null> => {
        forgetImageId(form.uploadCache, imageId);
        try { return await prepareTasks(jobs); } catch { return null; }
    }, [form.uploadCache, prepareTasks]);

    const submitRun = async (name: string | null) => {
        setConfirmOpen(false);
        const jobs = form.jobs;
        setSubmitError(null);
        setIsPreparing(true);
        try {
            const tasks = await prepareTasks(jobs);
            setUploadProgress(null);
            // Để trống tên (hoặc ≤ 20 job không hỏi) ⇒ dùng tên tự đặt như placeholder của dialog, thay vì "Lượt 1a2b3c4d".
            const runName = name ?? runAutoName(jobs[0] ?? "", jobs.length);
            const { runId } = await submitter.submit(jobs, tasks, { name: runName, ratio: form.aspectRatio, onImageNotFound: reuploadFor(jobs) });
            setActiveRunId(runId);
            draft.dismiss();
        } catch (error) {
            setSubmitError(describeApiError(error));
        } finally {
            setIsPreparing(false);
            setUploadProgress(null);
        }
    };

    const handleGenerate = () => {
        form.setShowValidation(true);
        if (!form.validation.valid) return;
        if (form.jobs.length > CONFIRM_THRESHOLD) setConfirmOpen(true);
        else void submitRun(null);
    };

    const handleExtend = useCallback((task: PortalTask) => {
        if (!task.result?.mediaId) return;
        form.startExtendFrom(task.result.mediaId, `Job #${(task.runIndex ?? 0) + 1}: ${(task.prompt ?? "").slice(0, 60)}`);
        scrollToTop();
    }, [form]);

    const remainingLocal = submitter.progress && submitter.progress.runId === activeRunId ? submitter.progress.total - submitter.progress.sent : 0;
    const maxPending = useAuthStore((s) => s.user?.plan?.maxPending ?? null);

    return (
        <>
            <div className="flex flex-col gap-3">
                {draft.pending && draft.pending.prompt !== form.prompt && <DraftRestoreBanner draft={draft.pending} onRestore={draft.restore} onDismiss={draft.dismiss} />}
                <ResumeBanner pending={submitter.pendingResume} isSubmitting={submitter.isSubmitting} onResume={(id) => { setActiveRunId(id); void submitter.resume(id); }} onDiscard={(id) => void submitter.discard(id)} />
                <RunBanner excludeRunId={activeRunId} />
                <DefaultGenerator
                    mode={form.mode}
                    spec={form.spec}
                    aspectRatio={form.aspectRatio}
                    setAspectRatio={form.setAspectRatio}
                    handleModeChange={form.handleModeChange}
                    setSettingsOpen={form.setSettingsOpen}
                    settings={form.settings}
                    setSettings={form.setSettings}
                    prompt={form.prompt}
                    setPrompt={form.setPrompt}
                    promptSplitMode={form.promptSplitMode}
                    setPromptSplitMode={form.setPromptSplitMode}
                    jobs={form.jobs}
                    attachments={form.attachments}
                    updateAttachments={form.updateAttachments}
                    sessionVideos={sessionVideos}
                    showValidation={form.showValidation}
                    validation={form.validation}
                    submitError={submitError ?? submitter.progress?.error ?? null}
                    estimatedCredits={form.estimatedCredits}
                    balance={form.balance}
                    fairUse={form.fairUse}
                    isGenerating={isPreparing || submitter.isSubmitting}
                    uploadProgress={uploadProgress}
                    sendProgress={submitter.isSubmitting && submitter.progress ? { sent: submitter.progress.sent, total: submitter.progress.total } : null}
                    handleGenerate={handleGenerate}
                />
            </div>
            {activeRunId && <ActiveRunSection runId={activeRunId} remainingLocal={remainingLocal} ratio={form.aspectRatio} onExtend={handleExtend} />}
            <ConfirmGenerateDialog
                open={confirmOpen}
                jobCount={form.jobs.length}
                estimatedCredits={form.estimatedCredits}
                balance={form.balance}
                queuedOnServer={maxPending !== null ? Math.max(0, form.jobs.length - maxPending) : 0}
                defaultName={runAutoName(form.jobs[0] ?? "", form.jobs.length)}
                onConfirm={(name) => void submitRun(name)}
                onCancel={() => setConfirmOpen(false)}
            />
            <GeneratorSettings
                open={form.settingsOpen}
                spec={form.spec}
                value={form.settings}
                splitMode={form.promptSplitMode}
                onSplitModeChange={form.setPromptSplitMode}
                onChange={form.setSettings}
                onClose={() => form.setSettingsOpen(false)}
                modelOptions={form.modelOptions}
            />
        </>
    );
}
