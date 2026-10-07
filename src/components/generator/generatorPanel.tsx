import { useMemo, useState } from "react";
import { AlertCircle, Coins, Loader2, Settings, Sparkles } from "lucide-react";

import { taskService } from "@/services/task.service";
import type { CreateTaskItem, PortalTask } from "@/types/api";
import ModeSelector from "./modeSelector";
import AspectRatioSelector from "./aspectRatioSelector";
import PromptEditor from "./promptEditor";
import GeneratorSettings from "./generatorSettings";
import ModeContent from "./modeContent";
import type {
    GeneratorFilesState,
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "./types";
import GeneratorResult, { type GeneratorResultItem } from "./generatorResult";

const IMAGE_MODES: GeneratorMode[] = [
    "text-to-image",
    "batch-image",
];

type GeneratorPanelProps = {
    variant?: "quick" | "advanced";
    layout?: "default" | "project";
};

type ValidationResult = {
    valid: boolean;
    message?: string;
}



const MODEL_CREDIT_COST: Record<string, number> = {
    "veo-3.1-lite": 5,
    "nano-banana-2-lite": 1,
};

function getDefaultModel(mode: GeneratorMode): string {
    if (IMAGE_MODES.includes(mode)) {
        return "nano-banana-2-lite";
    }

    return "veo-3.1-lite";
}

function validateGenerator(
    mode: GeneratorMode,
    jobs: string[],
    files: GeneratorFilesState,
): ValidationResult {
    if (jobs.length === 0) {
        return {
            valid: false,
            message: "Vui lòng nhập prompt.",
        };
    }

    switch (mode) {
        case "text-to-video":
            return {
                valid: true,
            };

        case "image-to-video":
            if (files.startFrame.length === 0) {
                return {
                    valid: false,
                    message: "Vui lòng tải lên Start Frame.",
                };
            }

            return {
                valid: true,
            };

        case "components":
            if (files.components.length === 0) {
                return {
                    valid: false,
                    message: "Vui lòng tải lên ít nhất 1 thành phần.",
                };
            }

            return {
                valid: true,
            };

        case "text-to-image":
            return {
                valid: true,
            };

        case "batch-image":
            if (
                files.fixedImages.length === 0 &&
                files.dynamicImages.length === 0
            ) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên ảnh Fixed hoặc Dynamic.",
                };
            }

            return {
                valid: true,
            };

        case "reference-video-voice":
            if (files.referenceVideos.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên Reference Video.",
                };
            }

            if (files.voiceAudio.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên Voice Audio.",
                };
            }

            return {
                valid: true,
            };

        case "batch-reference":
            if (files.batchReferences.length === 0) {
                return {
                    valid: false,
                    message:
                        "Vui lòng tải lên ít nhất 1 Reference.",
                };
            }

            return {
                valid: true,
            };

        default:
            return {
                valid: false,
                message: "Chế độ tạo không hợp lệ.",
            };
    }
}

async function pollBatch(
    batchId: string,
    onUpdate: (tasks: PortalTask[]) => void,
): Promise<PortalTask[]> {
    const maxAttempts = 150;
    const interval = 2000;

    let lastTasks: PortalTask[] = [];
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await taskService.getBatch(batchId);

        lastTasks = response.tasks;
        onUpdate(response.tasks);

        const allFinished = lastTasks.length > 0 && lastTasks.every(
            (task) => task.status === "succeeded" ||
                task.status === "failed" ||
                task.status === "cancelled",
        )

        if (allFinished) {
            return lastTasks;
        }

        await new Promise((resolve) =>
            setTimeout(resolve, interval),
        );
    }
    return lastTasks;
}
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

        setIsGenerating(true);

        const isImageMode =
            mode === "text-to-image" ||
            mode === "batch-image";

        const initialResults: GeneratorResultItem[] = jobs.map(
            (job, index) => ({
                id: `${Date.now()}-${index}`,
                jobIndex: index + 1,
                prompt: job,
                status: "pending",
                type: isImageMode ? "image" : "video",
            }),
        );

        setResults(initialResults);

        try {
            const isVideoMode = mode === "text-to-video";
            const isTextToImageMode = mode === "text-to-image";

            if (!isVideoMode && !isTextToImageMode) {
                throw new Error(
                    `Mode "${mode}" chưa được nối API backend.`,
                );
            }

            const tasks: CreateTaskItem[] = jobs.map((job) => {
                if (mode === "text-to-image") {
                    return {
                        worker: "text-to-image",
                        params: {
                            prompt: job,
                            ratio: aspectRatio,
                        },
                    };
                }

                return {
                    worker: "text-to-video",
                    params: {
                        prompt: job,
                        model: "veo_3_1_lite_low_priority",
                        ratio: aspectRatio,
                        generateAudio:
                            settings.generateAudio,
                    },
                };
            });

            console.log("Create tasks:", {
                mode,
                aspectRatio,
                jobs,
                settings,
                tasks,
                estimatedCredits,
            });

            const response = await taskService.createTasks({
                tasks,
            });

            console.log("Create tasks response:", response);

            setResults((currentResults) =>
                currentResults.map((item, index) => {
                    const backendTask = response.tasks[index];

                    if (!backendTask) {
                        return item;
                    }

                    return {
                        ...item,
                        id: backendTask.id,
                        batchId: response.batchId,
                        status:
                            backendTask.status === "succeeded"
                                ? "completed"
                                : backendTask.status === "failed" ||
                                    backendTask.status === "cancelled"
                                    ? "failed"
                                    : backendTask.status === "pending"
                                        ? "pending"
                                        : "processing",
                        url: backendTask.result?.url ?? undefined,
                        error: backendTask.error?.message ?? undefined,
                    };
                }),
            );

            const finishedTasks = await pollBatch(
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
                                status:
                                    task.status === "succeeded"
                                        ? "completed"
                                        : task.status === "failed" ||
                                            task.status === "cancelled"
                                            ? "failed"
                                            : task.status === "pending"
                                                ? "pending"
                                                : "processing",
                                url:
                                    task.result?.url ??
                                    undefined,
                                error:
                                    task.error?.message ??
                                    undefined,
                            };
                        }),
                    );
                },
            );


            setResults((currentResults) =>
                currentResults.map((item, index) => {
                    const task = finishedTasks[index];

                    if (!task) {
                        return item;
                    }

                    return {
                        ...item,
                        id: task.id,
                        status:
                            task.status === "succeeded"
                                ? "completed"
                                : task.status === "failed" ||
                                    task.status === "cancelled"
                                    ? "failed"
                                    : task.status === "pending"
                                        ? "pending"
                                        : "processing",
                        url:
                            task.result?.url ??
                            undefined,
                        error:
                            task.error?.message ??
                            undefined,
                    };
                }),
            );
        } catch (error) {
            console.error("Generate failed:", error);

            setResults((currentResults) =>
                currentResults.map((item) => ({
                    ...item,
                    status: "failed",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Không thể tạo nội dung.",
                })),
            );
        } finally {
            setIsGenerating(false);
        }
    };
    const handleRetry = (result: GeneratorResultItem) => {
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

        setTimeout(() => {
            setResults((currentResults) =>
                currentResults.map((item) =>
                    item.id === result.id
                        ? {
                            ...item,
                            status: "completed",
                        }
                        : item,
                ),
            );
        }, 3000);
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
                <div className="grid min-h-full grid-cols-1 lg:h-full lg:grid-cols-[30%_70%]">
                    <section className="min-w-0 border-b border-gray-200 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                                <ModeSelector
                                    value={mode}
                                    onChange={handleModeChange}
                                />

                                <AspectRatioSelector
                                    mode={mode}
                                    value={aspectRatio}
                                    onChange={setAspectRatio}
                                />

                                {variant === "advanced" && (
                                    <button
                                        type="button"
                                        onClick={() => setSettingsOpen(true)}
                                        className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 sm:w-11"
                                        aria-label="Cài đặt nâng cao"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                <span className="rounded-md bg-violet-100 px-2 py-1 font-medium text-violet-700">
                                    Advanced
                                </span>

                                <span className="text-gray-500">
                                    Model:{" "}
                                    <span className="font-medium text-gray-700">
                                        {settings.model ===
                                            "nano-banana-2-lite"
                                            ? "Nano Banana 2 Lite"
                                            : "Veo 3.1 - Lite"}
                                    </span>
                                </span>

                                <span className="text-gray-500">
                                    {settings.parallel} luồng
                                </span>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            <PromptEditor
                                value={prompt}
                                onChange={setPrompt}
                                splitMode={promptSplitMode}
                                onSplitModeChange={setPromptSplitMode}
                                customSeparator={settings.customSeparator}
                                onCustomSeparatorChange={(value: string) =>
                                    setSettings((current) => ({
                                        ...current,
                                        customSeparator: value,
                                    }))
                                }
                                jobCount={jobs.length}
                                singleJob={false}
                            />

                            <ModeContent
                                mode={mode}
                                files={files}
                                onFilesChange={handleFilesChange}
                            />


                            <div className="mt-5 border-t border-gray-100 pt-4">
                                {showValidation && !validation.valid && (
                                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-red-800">
                                                Chưa thể tạo
                                            </p>

                                            <p className="mt-0.5 text-xs leading-5 text-red-600">
                                                {validation.message}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Jobs
                                            </p>

                                            <p className="mt-1 text-base font-semibold text-gray-900">
                                                {jobs.length}
                                            </p>
                                        </div>

                                        <div className="h-8 w-px bg-gray-200" />

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Chi phí dự kiến
                                            </p>

                                            <div className="mt-1 flex items-center gap-1">
                                                <Coins className="h-4 w-4 text-violet-500" />

                                                <span className="text-base font-semibold text-gray-900">
                                                    {estimatedCredits.toLocaleString(
                                                        "vi-VN"
                                                    )}
                                                </span>

                                                <span className="text-xs text-gray-400">
                                                    credits
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={
                                            jobs.length === 0 ||
                                            isGenerating
                                        }
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Tạo video
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="min-w-0 min-h-0 overflow-y-auto bg-white">
                        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-950">
                                        Kết quả
                                    </h2>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Các video được tạo trong project này
                                    </p>
                                </div>

                                {results.length > 0 && (
                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-500">
                                        {results.length} jobs
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <GeneratorResult
                                results={results}
                                onRetry={handleRetry}
                                onDownload={handleDownload}
                            />
                        </div>
                    </section>
                </div>
            ) : (
                <>
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
                                <ModeSelector
                                    value={mode}
                                    onChange={handleModeChange}
                                />

                                <AspectRatioSelector
                                    mode={mode}
                                    value={aspectRatio}
                                    onChange={setAspectRatio}
                                />

                                {variant === "advanced" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSettingsOpen(true)
                                        }
                                        className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 md:w-11"
                                        aria-label="Cài đặt nâng cao"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                <span className="rounded-md bg-violet-100 px-2 py-1 font-medium text-violet-700">
                                    {variant === "quick"
                                        ? "Quick"
                                        : "Advanced"}
                                </span>

                                <span className="text-gray-500">
                                    Model:{" "}
                                    <span className="font-medium text-gray-700">
                                        {settings.model ===
                                            "nano-banana-2-lite"
                                            ? "Nano Banana 2 Lite"
                                            : "Veo 3.1 - Lite"}
                                    </span>
                                </span>

                                {variant === "advanced" && (
                                    <span className="text-gray-500">
                                        {settings.parallel} luồng
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="p-4 sm:p-5">
                            <PromptEditor
                                value={prompt}
                                onChange={setPrompt}
                                splitMode={promptSplitMode}
                                onSplitModeChange={setPromptSplitMode}
                                customSeparator={
                                    settings.customSeparator
                                }
                                onCustomSeparatorChange={(
                                    value: string,
                                ) =>
                                    setSettings((current) => ({
                                        ...current,
                                        customSeparator: value,
                                    }))
                                }
                                jobCount={jobs.length}
                                singleJob={variant === "quick"}
                            />

                            <ModeContent
                                mode={mode}
                                files={files}
                                onFilesChange={handleFilesChange}
                            />

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                {showValidation && !validation.valid && (
                                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-red-800">
                                                Chưa thể tạo
                                            </p>

                                            <p className="mt-0.5 text-xs leading-5 text-red-600">
                                                {validation.message}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Jobs
                                            </p>

                                            <p className="mt-1 text-base font-semibold text-gray-900">
                                                {jobs.length}
                                            </p>
                                        </div>

                                        <div className="h-7 w-px bg-gray-200" />

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Chi phí dự kiến
                                            </p>

                                            <div className="mt-1 flex items-center gap-1">
                                                <Coins className="h-4 w-4 text-violet-500" />

                                                <span className="text-base font-semibold text-gray-900">
                                                    {estimatedCredits.toLocaleString(
                                                        "vi-VN",
                                                    )}
                                                </span>

                                                <span className="text-xs text-gray-400">
                                                    credits
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={
                                            jobs.length === 0 ||
                                            isGenerating
                                        }
                                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:w-auto"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Tạo
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <GeneratorResult
                        results={results}
                        onRetry={handleRetry}
                        onDownload={handleDownload}
                        onCancel={handleCancel}
                    />
                </>
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
