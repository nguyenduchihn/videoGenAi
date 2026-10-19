import { useCallback, useMemo, useState } from "react";
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
import { useRunActions } from "@/features/runs/useRuns";
import { useRunSubmitter } from "@/features/runs/useRunSubmitter";
import { useFeedback } from "@/hooks/useFeedback";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import type { CreateTaskItem } from "@/types/api";
import GeneratorSettings from "./generatorSettings";
import DefaultGenerator from "./layouts/defaultGenerator";

const CONFIRM_THRESHOLD = 20;

/** Khối hành động của lượt đang hiện ở Trang chủ (huỷ/thử lại/hủy từng task). */
function ActiveRunSection({ runId, remainingLocal, ratio }: { runId: string; remainingLocal: number; ratio: string; }) {
    const { toast, confirm } = useFeedback();
    const actions = useRunActions(runId);
    const taskActions: RunTaskActions = useMemo(() => ({
        onRetry: (task) => actions.retryFailed.mutate([task.id], { onError: (e) => toast.error(getErrorMessage(e)) }),
        onCancel: (task) => actions.cancelOne.mutate(task.id, { onError: (e) => toast.error(getErrorMessage(e)) }),

        onDownload: async (task) => {
            const url = task.result?.url;

            if (!url) {
                toast.warning(
                    `Job #${(task.runIndex ?? 0) + 1} chưa có file kết quả để tải.`,
                );
                return;
            }

            type WritableFile = {
                write: (data: Blob) => Promise<void>;
                close: () => Promise<void>;
            };

            type DirectoryPickerWindow = Window & {
                showDirectoryPicker?: () => Promise<{
                    getFileHandle: (
                        name: string,
                        options: { create: boolean },
                    ) => Promise<{
                        createWritable: () => Promise<WritableFile>;
                    }>;
                }>;
            };

            let writableFile: WritableFile | null = null;

            try {
                const pickerWindow = window as DirectoryPickerWindow;

                if (pickerWindow.showDirectoryPicker) {
                    try {
                        const directory =
                            await pickerWindow.showDirectoryPicker();


                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        const blob = await response.blob();

                        if (blob.size === 0) {
                            throw new Error("File tải về đang trống.");
                        }

                        const contentType = blob.type.toLowerCase();
                        const urlPath = new URL(
                            url,
                            window.location.href,
                        ).pathname;

                        const urlExtension =
                            urlPath.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();

                        const allowedExtensions = [
                            "png", "jpg", "jpeg", "webp", "gif",
                            "mp4", "webm", "mov",
                        ];

                        const extensionByType: Record<string, string> = {
                            "image/png": "png",
                            "image/jpeg": "jpg",
                            "image/webp": "webp",
                            "image/gif": "gif",
                            "video/mp4": "mp4",
                            "video/webm": "webm",
                            "video/quicktime": "mov",
                        };

                        const extension =
                            extensionByType[contentType] ??
                            (urlExtension &&
                                allowedExtensions.includes(urlExtension)
                                ? urlExtension
                                : contentType.startsWith("image/")
                                    ? "png"
                                    : contentType.startsWith("video/")
                                        ? "mp4"
                                        : "bin");

                        const filename =
                            `videogen-job-${(task.runIndex ?? 0) + 1}.${extension}`;

                        const fileHandle = await directory.getFileHandle(
                            filename,
                            { create: true },
                        );

                        writableFile = await fileHandle.createWritable();
                        await writableFile.write(blob);
                        await writableFile.close();
                        writableFile = null;

                        toast.success("Đã lưu file vào thư mục bạn chọn.");
                        return;
                    } catch (error) {
                        if (
                            error instanceof DOMException &&
                            error.name === "AbortError"
                        ) {
                            return;
                        }

                        throw error;
                    }
                }

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const blob = await response.blob();

                if (blob.size === 0) {
                    throw new Error("File tải về đang trống.");
                }

                const contentType = blob.type.toLowerCase();
                const urlPath = new URL(url, window.location.href).pathname;
                const urlExtension =
                    urlPath.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();

                const extensionByType: Record<string, string> = {
                    "image/png": "png",
                    "image/jpeg": "jpg",
                    "image/webp": "webp",
                    "image/gif": "gif",
                    "video/mp4": "mp4",
                    "video/webm": "webm",
                    "video/quicktime": "mov",
                };

                const extension =
                    extensionByType[contentType] ??
                    urlExtension ??
                    (contentType.startsWith("image/") ? "png" :
                        contentType.startsWith("video/") ? "mp4" : "bin");

                const filename =
                    `videogen-job-${(task.runIndex ?? 0) + 1}.${extension}`;

                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = objectUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();

                window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                toast.success("Đã bắt đầu tải file.");
            } catch (error) {
                console.error("Không thể tải file kết quả:", error);

                const message =
                    error instanceof Error ? error.message : "Lỗi không xác định";

                toast.error(
                    `Không tải được file: ${message}. Nếu lỗi liên quan đến fetch/CORS, cần kiểm tra quyền truy cập URL hoặc bổ sung endpoint tải file ở backend.`,
                );
            }
        },
    }), [actions.cancelOne, actions.retryFailed, toast]);
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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [activeRunId, setActiveRunId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const draftSnapshot = useMemo(() => ({ prompt: form.prompt, mode: form.mode, ratio: form.aspectRatio, settings: form.settings }), [form.aspectRatio, form.mode, form.prompt, form.settings]);
    const draft = useAutoDraft(userId, draftSnapshot, form.applyDraft);

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

    const remainingLocal = submitter.progress && submitter.progress.runId === activeRunId ? submitter.progress.total - submitter.progress.sent : 0;
    const maxPending = useAuthStore((s) => s.user?.plan?.maxPending ?? null);

    return (
        <>

            <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                {/* Bên trái */}
                <div className="flex min-w-0 flex-col gap-3">
                    {draft.pending && draft.pending.prompt !== form.prompt && (
                        <DraftRestoreBanner
                            draft={draft.pending}
                            onRestore={draft.restore}
                            onDismiss={draft.dismiss}
                        />
                    )}

                    <ResumeBanner
                        pending={submitter.pendingResume}
                        isSubmitting={submitter.isSubmitting}
                        onResume={(id) => {
                            setActiveRunId(id);
                            void submitter.resume(id);
                        }}
                        onDiscard={(id) => void submitter.discard(id)}
                    />

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
                        showValidation={form.showValidation}
                        validation={form.validation}
                        submitError={submitError ?? submitter.progress?.error ?? null}
                        estimatedCredits={form.estimatedCredits}
                        balance={form.balance}
                        fairUse={form.fairUse}
                        isGenerating={isPreparing || submitter.isSubmitting}
                        uploadProgress={uploadProgress}
                        sendProgress={
                            submitter.isSubmitting && submitter.progress
                                ? {
                                    sent: submitter.progress.sent,
                                    total: submitter.progress.total,
                                }
                                : null
                        }
                        handleGenerate={handleGenerate}
                    />
                </div>

                {/* Bên phải là kết quả*/}
                <div className="min-w-0">
                    {activeRunId ? (
                        <ActiveRunSection
                            runId={activeRunId}
                            remainingLocal={remainingLocal}
                            ratio={form.aspectRatio}
                        />
                    ) : (
                        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
                            Kết quả tạo ảnh/video sẽ hiển thị tại đây sau khi bạn bắt đầu tạo.
                        </div>
                    )}
                </div>
            </div>
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
