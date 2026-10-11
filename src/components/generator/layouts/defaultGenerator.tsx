
import type { Dispatch, SetStateAction } from "react";
import {
    AlertCircle,
    Coins,
    Loader2,
    Settings,
    Sparkles,
} from "lucide-react";

import ModeSelector from "../modeSelector";
import AspectRatioSelector from "../aspectRatioSelector";
import PromptEditor from "../promptEditor";
import ModeContent from "../modeContent";
import GeneratorResult, {
    type GeneratorResultItem,
} from "../generatorResult";

import type {
    GeneratorFilesState,
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "../types";

import type { ValidationResult } from "../ultils/generatorHelpers";

type DefaultGeneratorLayoutProps = {
    variant: "quick" | "advanced";
    mode: GeneratorMode;
    aspectRatio: string;
    setAspectRatio: (value: string) => void;
    handleModeChange: (mode: GeneratorMode) => void;
    setSettingsOpen: (open: boolean) => void;
    settings: GeneratorSettingsState;
    setSettings: Dispatch<SetStateAction<GeneratorSettingsState>>;
    prompt: string;
    setPrompt: (value: string) => void;
    promptSplitMode: PromptSplitMode;
    setPromptSplitMode: (value: PromptSplitMode) => void;
    jobs: string[];
    files: GeneratorFilesState;
    handleFilesChange: (
        field: keyof GeneratorFilesState,
        files: File[],
    ) => void;
    showValidation: boolean;
    validation: ValidationResult;
    estimatedCredits: number;
    isGenerating: boolean;
    handleGenerate: () => void;
    results: GeneratorResultItem[];
    handleRetry: (result: GeneratorResultItem) => void;
    handleDownload: (result: GeneratorResultItem) => void;
    handleCancel: (result: GeneratorResultItem) => void;
};

export default function DefaultGenerator({
    variant,
    mode,
    aspectRatio,
    setAspectRatio,
    handleModeChange,
    setSettingsOpen,
    settings,
    setSettings,
    prompt,
    setPrompt,
    promptSplitMode,
    setPromptSplitMode,
    jobs,
    files,
    handleFilesChange,
    showValidation,
    validation,
    estimatedCredits,
    isGenerating,
    handleGenerate,
    results,
    handleRetry,
    handleDownload,
    handleCancel,
}: DefaultGeneratorLayoutProps) {
    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
                <div className="border-b border-[var(--app-border)] p-4 sm:p-5">
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
                                className="flex h-11 w-full items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] sm:w-11"
                                aria-label="Cài đặt nâng cao"
                            >
                                <Settings className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                        <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-1 font-medium text-[var(--app-accent)]">
                            {variant === "quick"
                                ? "Quick"
                                : "Advanced"}
                        </span>

                        <span className="text-[var(--app-text-secondary)]">
                            Model:{" "}
                            <span className="font-medium text-[var(--app-text)]">
                                {settings.model ===
                                    "Nano_banana_2_lite"
                                    ? "Nano Banana 2 Lite"
                                    : "Veo_3.1-Lite"}
                            </span>
                        </span>

                        {variant === "advanced" && (
                            <span className="text-[var(--app-text-secondary)]">
                                {settings.parallel} luồng
                            </span>
                        )}
                    </div>
                </div>
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

                    <div className="mt-5 border-t border-[var(--app-border)] pt-4">
                        {showValidation && !validation.valid && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                                        Chưa thể tạo
                                    </p>

                                    <p className="mt-0.5 text-xs leading-5 text-red-600 dark:text-red-400">
                                        {validation.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Jobs
                                    </p>

                                    <p className="mt-1 text-base font-semibold text-[var(--app-text)]">
                                        {jobs.length}
                                    </p>
                                </div>

                                <div className="h-7 w-px bg-[var(--app-border)]" />

                                <div>
                                    <p className="text-xs text-[var(--app-text-muted)]">
                                        Chi phí dự kiến
                                    </p>

                                    <div className="mt-1 flex items-center gap-1">
                                        <Coins className="h-4 w-4 text-[var(--app-accent)]" />

                                        <span className="text-base font-semibold text-[var(--app-text)]">
                                            {estimatedCredits.toLocaleString(
                                                "vi-VN",
                                            )}
                                        </span>

                                        <span className="text-xs text-[var(--app-text-muted)]">
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
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)] disabled:text-[var(--app-text-muted)] sm:w-auto"
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
    );
}
