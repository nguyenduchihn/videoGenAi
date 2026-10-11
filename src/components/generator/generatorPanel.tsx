import { useMemo, useState } from "react";
import { imageService } from "@/services/image.service";
import { taskService } from "@/services/task.service";
import type { CreateTaskItem } from "@/types/api";
import GeneratorSettings from "./generatorSettings";
import type {
    GeneratorFilesState,
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "./types";
import { type GeneratorResultItem } from "./generatorResult";

import {
    MODEL_CREDIT_COST,
    getDefaultModel,
    validateGenerator,
    getGeneratorErrorMessage,
    getTaskErrorMessage,
    pollBatch,
} from "./ultils/generatorHelpers";
import ProjectGenerator from "./layouts/projectGenerator";
import DefaultGenerator from "./layouts/defaultGenerator";

type GeneratorPanelProps = {
    variant?: "quick" | "advanced";
    layout?: "default" | "project";
};
export default function GeneratorPanel({
    variant = "advanced",
    layout = "default"
}: GeneratorPanelProps) {
    const [showValidation, setShowValidation] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<GeneratorResultItem[]>([]);
    const [mode, setMode] =
        useState<GeneratorMode>("text-to-video");

    const [aspectRatio, setAspectRatio] =
        useState("16:9");

    const [prompt, setPrompt] =
        useState("");

    const [files, setFiles] =
        useState<GeneratorFilesState>({
            startFrame: [],
            endFrame: [],

            components: [],

            referenceImages: [],

            fixedImages: [],
            dynamicImages: [],

            referenceVideos: [],
            voiceAudio: [],

            batchReferences: [],
        });

    const [promptSplitMode, setPromptSplitMode] =
        useState<PromptSplitMode>("newline");

    const [settingsOpen, setSettingsOpen] =
        useState(false);

    const [settings, setSettings] =
        useState<GeneratorSettingsState>({
            model: getDefaultModel("text-to-video"),
            parallel: 8,
            batchDelay: 10,
            burstSize: 1,
            generateAudio: true,
            upscaleThreads: 1,
            customSeparator: "===",
        });

    const jobs = useMemo(() => {
        const input = prompt.trim();

        if (!input) {
            return [];
        }

        if (variant === "quick") {
            return [input];
        }

        switch (promptSplitMode) {
            case "newline":
                return input
                    .split(/\r?\n/)
                    .map((item) => item.trim())
                    .filter(Boolean);

            case "blank-line":
                return input
                    .split(/\r?\n\s*\r?\n/)
                    .map((item) => item.trim())
                    .filter(Boolean);

            case "separator":
                return input
                    .split("====")
                    .map((item) => item.trim())
                    .filter(Boolean);

            case "custom": {
                const separator = settings.customSeparator.trim();

                if (!separator) {
                    return [input];
                }

                return input
                    .split(separator)
                    .map((item) => item.trim())
                    .filter(Boolean);
            }

            default:
                return [input];
        }
    }, [
        prompt,
        promptSplitMode,
        settings.customSeparator,
        variant,
    ]);

    const creditPerJob =
        MODEL_CREDIT_COST[settings.model] ?? 0;

    const estimatedCredits =
        jobs.length * creditPerJob;

    const validation = validateGenerator(
        mode,
        jobs,
        files,
    );

    const handleFilesChange = (
        field: keyof GeneratorFilesState,
        nextFiles: File[],
    ) => {
        setFiles((current) => ({
            ...current,
            [field]: nextFiles,
        }));
    };

    const handleModeChange = (nextMode: GeneratorMode) => {

        setShowValidation(false);

        setMode(nextMode);

        setSettings((current) => ({
            ...current,
            model: getDefaultModel(nextMode),
        }));

        const isImageMode =
            nextMode === "text-to-image" ||
            nextMode === "batch-image";

        setAspectRatio(
            isImageMode
                ? "1:1"
                : "16:9",
        );
    };

    const handleGenerate = async () => {
        setShowValidation(true);

        if (!validation.valid) {
            return;
        }

        if (estimatedCredits <= 0) {
            return;
        }

        if (jobs.length > 20) {
            setResults((currentResults) => [
                ...currentResults,
                {
                    id: `limit-${Date.now()}`,
                    jobIndex: currentResults.length + 1,
                    prompt: "",
                    status: "failed",
                    type:
                        mode === "text-to-image" ||
                            mode === "batch-image"
                            ? "image"
                            : "video",
                    error: "Mỗi lần chỉ được tạo tối đa 20 task.",
                },
            ]);

            return;
        }

        setIsGenerating(true);

        const newResults: GeneratorResultItem[] =
            jobs.map((job, index) => ({
                id: `${Date.now()}-${index}`,
                jobIndex: index + 1,
                prompt: job,
                status: "processing",
                type:
                    mode === "text-to-image" ||
                        mode === "batch-image"
                        ? "image"
                        : "video",
            }));

        setResults(newResults);

        try {

            let startImageId: string | undefined;
            let endImageId: string | undefined;

            if (mode === "image-to-video") {
                if (files.startFrame[0]) {
                    startImageId =
                        await imageService.uploadImage(
                            files.startFrame[0],
                        );
                }

                if (files.endFrame[0]) {
                    endImageId =
                        await imageService.uploadImage(
                            files.endFrame[0],
                        );
                }
            }


            const tasks: CreateTaskItem[] = jobs.map(
                (job) => {

                    if (mode === "image-to-video") {
                        if (!startImageId) {
                            throw new Error(
                                "START_FRAME_REQUIRED",
                            );
                        }

                        if (endImageId) {
                            return {
                                worker:
                                    "start-end-image-to-video",
                                params: {
                                    prompt: job,
                                    model: settings.model,
                                    ratio: aspectRatio,
                                    generateAudio:
                                        settings.generateAudio,
                                },
                                images: {
                                    start: startImageId,
                                    end: endImageId,
                                },
                            };
                        }

                        return {
                            worker: "image-to-video",
                            params: {
                                prompt: job,
                                model: settings.model,
                                ratio: aspectRatio,
                                generateAudio:
                                    settings.generateAudio,
                            },
                            images: {
                                start: startImageId,
                            },
                        };
                    }


                    if (mode === "text-to-video") {
                        return {
                            worker: "text-to-video",
                            params: {
                                prompt: job,
                                model: settings.model,
                                ratio: aspectRatio,
                                generateAudio:
                                    settings.generateAudio,
                            },
                        };
                    }


                    if (mode === "text-to-image") {
                        return {
                            worker: "text-to-image",
                            params: {
                                prompt: job,
                                model: settings.model,
                                ratio: aspectRatio,
                            },
                        };
                    }

                    throw new Error(
                        `Mode "${mode}" chưa được nối API backend.`,
                    );
                },
            );


            const response =
                await taskService.createTasks({
                    tasks,
                });

            setResults((currentResults) =>
                currentResults.map((item, index) => ({
                    ...item,
                    id:
                        response.tasks[index]?.id ??
                        item.id,
                    status: "processing",
                })),
            );


            if (response.batchId) {
                await pollBatch(
                    response.batchId,
                    (tasks) => {
                        setResults((currentResults) =>
                            currentResults.map((item, index) => {
                                const task = tasks[index];

                                if (!task) {
                                    return item;
                                }

                                return {
                                    ...item,
                                    id: task.id,
                                    batchId: task.batchId,
                                    status:
                                        task.status === "succeeded"
                                            ? "completed"
                                            : task.status === "failed" ||
                                                task.status === "cancelled"
                                                ? "failed"
                                                : "processing",
                                    url: task.result?.url ?? undefined,
                                    error:
                                        task.error
                                            ? getTaskErrorMessage(task.error.code, task.error.message)
                                            : undefined,
                                };
                            }),
                        );
                    },
                );
            }
        } catch (error) {
            console.error(
                "Generator error:",
                error,
            );

            const message = getGeneratorErrorMessage(error);

            setResults((currentResults) =>
                currentResults.map((item) => ({
                    ...item,
                    status: "failed",
                    error: message,
                })),
            );
        } finally {
            setIsGenerating(false);
        }
    };
    const handleRetry = async (result: GeneratorResultItem) => {
        setResults((currentResults) =>
            currentResults.map((item) =>
                item.id === result.id
                    ? {
                        ...item,
                        status: "processing",
                        error: undefined,
                    }
                    : item,
            ),
        );

        try {
            let startImageId: string | undefined;
            let endImageId: string | undefined;

            if (mode === "image-to-video") {
                if (files.startFrame[0]) {
                    startImageId =
                        await imageService.uploadImage(
                            files.startFrame[0],
                        );
                }

                if (files.endFrame[0]) {
                    endImageId =
                        await imageService.uploadImage(
                            files.endFrame[0],
                        );
                }
            }

            let task: CreateTaskItem;

            if (mode === "text-to-video") {
                task = {
                    worker: "text-to-video",
                    params: {
                        prompt: result.prompt,
                        model: settings.model,
                        ratio: aspectRatio,
                        generateAudio:
                            settings.generateAudio,
                    },
                };
            } else if (mode === "image-to-video") {
                if (!startImageId) {
                    throw new Error(
                        "START_FRAME_REQUIRED",
                    );
                }

                if (endImageId) {
                    task = {
                        worker:
                            "start-end-image-to-video",
                        params: {
                            prompt: result.prompt,
                            model: settings.model,
                            ratio: aspectRatio,
                            generateAudio:
                                settings.generateAudio,
                        },
                        images: {
                            start: startImageId,
                            end: endImageId,
                        },
                    };
                } else {
                    task = {
                        worker: "image-to-video",
                        params: {
                            prompt: result.prompt,
                            model: settings.model,
                            ratio: aspectRatio,
                            generateAudio:
                                settings.generateAudio,
                        },
                        images: {
                            start: startImageId,
                        },
                    };
                }
            } else if (mode === "text-to-image") {
                task = {
                    worker: "text-to-image",
                    params: {
                        prompt: result.prompt,
                        model: settings.model,
                        ratio: aspectRatio,
                    },
                };
            } else {
                throw new Error(
                    `Mode "${mode}" chưa được nối API backend.`,
                );
            }

            const response =
                await taskService.createTasks({
                    tasks: [task],
                });

            const newTaskId =
                response.tasks[0]?.id;

            setResults((currentResults) =>
                currentResults.map((item) =>
                    item.id === result.id
                        ? {
                            ...item,
                            id:
                                newTaskId ??
                                item.id,
                            status: "processing",
                        }
                        : item,
                ),
            );

            if (!response.batchId) {
                throw new Error(
                    "BATCH_ID_MISSING",
                );
            }

            await pollBatch(
                response.batchId,
                (tasks) => {
                    const taskResult = tasks[0];

                    if (!taskResult) {
                        return;
                    }

                    setResults(
                        (currentResults) =>
                            currentResults.map(
                                (item) =>
                                    item.id ===
                                        result.id ||
                                        item.id === newTaskId
                                        ? {
                                            ...item,
                                            id:
                                                taskResult.id,
                                            batchId:
                                                taskResult.batchId,
                                            status:
                                                taskResult.status ===
                                                    "succeeded"
                                                    ? "completed"
                                                    : taskResult.status ===
                                                        "failed" ||
                                                        taskResult.status ===
                                                        "cancelled"
                                                        ? "failed"
                                                        : "processing",
                                            url:
                                                taskResult
                                                    .result
                                                    ?.url ??
                                                undefined,
                                            error:
                                                taskResult
                                                    .error
                                                    ?.message ??
                                                undefined,
                                        }
                                        : item,
                            ),
                    );
                },
            );
        } catch (error) {
            console.error(
                "Retry generator error:",
                error,
            );

            const message = getGeneratorErrorMessage(error);

            setResults((currentResults) =>
                currentResults.map((item) =>
                    item.id === result.id
                        ? {
                            ...item,
                            status: "failed",
                            error: message,
                        }
                        : item,
                ),
            );
        }
    };
    const handleDownload = (result: GeneratorResultItem) => {
        console.log("Download result:", result);
        if (!result.url) {
            console.log(
                `Chưa có URL thật cho Job #${result.jobIndex}`,
            );
            return;
        }

        window.open(result.url, "_blank");
    };
    const handleCancel = async (
        result: GeneratorResultItem,
    ) => {
        try {
            if (!result.id) {
                return;
            }

            await taskService.cancelTask(result.id);

            setResults((currentResults) =>
                currentResults.map((item) =>
                    item.id === result.id
                        ? {
                            ...item,
                            status: "failed",
                            error: "Đã hủy tạo.",
                        }
                        : item,
                ),
            );
        } catch (error) {
            console.error("Cancel task failed:", error);

            setResults((currentResults) =>
                currentResults.map((item) =>
                    item.id === result.id
                        ? {
                            ...item,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : "Không thể hủy tác vụ.",
                        }
                        : item,
                ),
            );
        }
    };

    return (
        <>
            {layout === "project" ? (
                <ProjectGenerator
                    variant={variant}
                    mode={mode}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    handleModeChange={handleModeChange}
                    setSettingsOpen={setSettingsOpen}
                    settings={settings}
                    setSettings={setSettings}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    promptSplitMode={promptSplitMode}
                    setPromptSplitMode={setPromptSplitMode}
                    jobs={jobs}
                    files={files}
                    handleFilesChange={handleFilesChange}
                    showValidation={showValidation}
                    validation={validation}
                    estimatedCredits={estimatedCredits}
                    isGenerating={isGenerating}
                    handleGenerate={handleGenerate}
                    results={results}
                    handleRetry={handleRetry}
                    handleDownload={handleDownload}
                />
            ) : (
                <DefaultGenerator
                    variant={variant}
                    mode={mode}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    handleModeChange={handleModeChange}
                    setSettingsOpen={setSettingsOpen}
                    settings={settings}
                    setSettings={setSettings}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    promptSplitMode={promptSplitMode}
                    setPromptSplitMode={setPromptSplitMode}
                    jobs={jobs}
                    files={files}
                    handleFilesChange={handleFilesChange}
                    showValidation={showValidation}
                    validation={validation}
                    estimatedCredits={estimatedCredits}
                    isGenerating={isGenerating}
                    handleGenerate={handleGenerate}
                    results={results}
                    handleRetry={handleRetry}
                    handleDownload={handleDownload}
                    handleCancel={handleCancel}
                />
            )}

            <GeneratorSettings
                open={settingsOpen}
                mode={mode}
                value={settings}
                splitMode={promptSplitMode}
                onSplitModeChange={setPromptSplitMode}
                onChange={setSettings}
                onClose={() => setSettingsOpen(false)}
            />
        </>
    );
}
