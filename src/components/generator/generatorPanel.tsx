import { useCallback, useMemo, useState } from "react";
import { buildTasks } from "@/features/generator/buildTasks";
import { describeApiError } from "@/features/generator/errorCopy";
import { forgetImageId, uploadAttachments, type UploadProgress } from "@/features/generator/uploadAttachments";
import { useBatchRunner } from "@/features/generator/useBatchRunner";
import { useGeneratorForm } from "@/features/generator/useGeneratorForm";
import { VIDEO_WORKERS, workerLabel } from "@/features/tasks/workerLabels";
import { useTasksHistory } from "@/hooks/useTasksHistory";
import type { CreateTaskItem } from "@/types/api";
import GeneratorSettings from "./generatorSettings";
import DefaultGenerator from "./layouts/defaultGenerator";
import ProjectGenerator from "./layouts/projectGenerator";
import type { SessionVideo } from "./sourceVideoPicker";
import type { GeneratorResultItem } from "./types";

type GeneratorPanelProps = {
    variant?: "quick" | "advanced";
    layout?: "default" | "project";
    draftId?: string;
};

const resultLabel = (result: GeneratorResultItem): string => `Job #${result.jobIndex}: ${result.prompt.slice(0, 60)}`;

export default function GeneratorPanel({ variant = "advanced", layout = "default", draftId }: GeneratorPanelProps) {
    const form = useGeneratorForm({ variant, draftId });
    const runner = useBatchRunner();
    const history = useTasksHistory("succeeded", { enabled: form.mode === "extend-video" });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

    const sessionVideos = useMemo<SessionVideo[]>(() => {
        const fromSession = runner.results
            .filter((item) => item.status === "completed" && item.type === "video" && item.mediaId)
            .map((item): SessionVideo => ({ mediaId: item.mediaId!, label: resultLabel(item), url: item.url, source: "session" }));
        const known = new Set(fromSession.map((video) => video.mediaId));
        const fromHistory = (history.data?.pages ?? [])
            .flatMap((page) => page.tasks)
            .filter((task) => VIDEO_WORKERS.has(task.worker) && task.result?.mediaId && !known.has(task.result.mediaId))
            .map((task): SessionVideo => ({
                mediaId: task.result!.mediaId,
                label: workerLabel(task.worker),
                url: task.result?.url ?? undefined,
                createdAt: task.createdAt,
                source: "history",
            }));
        return [...fromSession, ...fromHistory];
    }, [runner.results, history.data]);

    /** Upload ảnh còn thiếu (cache theo File) rồi dựng task cho các prompt đã cho. */
    const prepareTasks = useCallback(async (jobs: string[]): Promise<CreateTaskItem[]> => {
        const resolved = await uploadAttachments(form.attachments, form.uploadCache, { onProgress: setUploadProgress });
        return buildTasks(form.mode, jobs, form.settings, form.aspectRatio, resolved);
    }, [form.attachments, form.uploadCache, form.mode, form.settings, form.aspectRatio]);

    /** IMAGE_NOT_FOUND giữa chừng: quên id cũ, tải lại ảnh và dựng lại ĐÚNG bộ prompt đã gửi (snapshot). */
    const reuploadFor = useCallback((jobs: string[]) => async (imageId: string): Promise<CreateTaskItem[] | null> => {
        forgetImageId(form.uploadCache, imageId);
        try {
            return await prepareTasks(jobs);
        } catch {
            return null;
        }
    }, [form.uploadCache, prepareTasks]);

    const handleGenerate = async () => {
        form.setShowValidation(true);
        if (!form.validation.valid) return;
        const jobs = form.jobs;
        setSubmitError(null);
        setIsPreparing(true);
        try {
            const tasks = await prepareTasks(jobs);
            void runner.submit(tasks, jobs, { ratio: form.aspectRatio, onImageNotFound: reuploadFor(jobs) });
        } catch (error) {
            setSubmitError(describeApiError(error));
        } finally {
            setIsPreparing(false);
            setUploadProgress(null);
        }
    };

    const handleRetry = async (result: GeneratorResultItem) => {
        setSubmitError(null);
        try {
            const [task] = await prepareTasks([result.prompt]);
            if (task) void runner.retry(result, task, { ratio: form.aspectRatio, onImageNotFound: reuploadFor([result.prompt]) });
        } catch (error) {
            setSubmitError(describeApiError(error));
        } finally {
            setUploadProgress(null);
        }
    };

    const handleExtend = (result: GeneratorResultItem) => {
        if (!result.mediaId) return;
        form.startExtendFrom(result.mediaId, resultLabel(result));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const layoutProps = {
        variant,
        mode: form.mode,
        spec: form.spec,
        aspectRatio: form.aspectRatio,
        setAspectRatio: form.setAspectRatio,
        handleModeChange: form.handleModeChange,
        setSettingsOpen: form.setSettingsOpen,
        settings: form.settings,
        setSettings: form.setSettings,
        prompt: form.prompt,
        setPrompt: form.setPrompt,
        promptSplitMode: form.promptSplitMode,
        setPromptSplitMode: form.setPromptSplitMode,
        jobs: form.jobs,
        attachments: form.attachments,
        updateAttachments: form.updateAttachments,
        sessionVideos,
        showValidation: form.showValidation,
        validation: form.validation,
        submitError,
        estimatedCredits: form.estimatedCredits,
        balance: form.balance,
        isGenerating: isPreparing || runner.isGenerating,
        uploadProgress,
        handleGenerate: () => { void handleGenerate(); },
        results: runner.results,
        queueNotice: runner.queueNotice,
        handleRetry: (result: GeneratorResultItem) => { void handleRetry(result); },
        handleDownload: runner.download,
        handleCancel: (result: GeneratorResultItem) => { void runner.cancel(result); },
        handleCancelAll: () => { void runner.cancelAll(); },
        handleExtend,
    };

    return (
        <>
            {layout === "project" ? <ProjectGenerator {...layoutProps} /> : <DefaultGenerator {...layoutProps} />}
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
