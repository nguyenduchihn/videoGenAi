import { useGeneratorForm } from "@/features/generator/useGeneratorForm";
import { useBatchRunner } from "@/features/generator/useBatchRunner";
import { buildTasks, type UploadedIds } from "@/features/generator/buildTasks";
import { getModelOptions } from "@/features/generator/modelCatalog";
import GeneratorSettings from "./generatorSettings";
import DefaultGenerator from "./layouts/defaultGenerator";
import ProjectGenerator from "./layouts/projectGenerator";
import type { GeneratorResultItem } from "./generatorResult";

type GeneratorPanelProps = {
    variant?: "quick" | "advanced";
    layout?: "default" | "project";
    draftId?: string;
};

export default function GeneratorPanel({
    variant = "advanced",
    layout = "default",
    draftId,
}: GeneratorPanelProps) {
    const form = useGeneratorForm({ variant, draftId });
    const runner = useBatchRunner();

    const handleGenerate = () => {
        form.setShowValidation(true);
        if (!form.validation.valid) return;
        const buildFn = (ids: UploadedIds) =>
            buildTasks(form.mode, form.jobs, form.settings, form.aspectRatio, ids);
        void runner.submit(form.jobs, buildFn, {
            mode: form.mode,
            modelKey: form.settings.model,
            files: form.files,
            estimatedCredits: form.estimatedCredits,
        });
    };

    const handleRetry = (result: GeneratorResultItem) => {
        const buildFn = (ids: UploadedIds) =>
            buildTasks(form.mode, [result.prompt], form.settings, form.aspectRatio, ids)[0]!;
        void runner.retry(result, buildFn, { mode: form.mode, files: form.files });
    };

    const sharedProps = {
        variant,
        mode: form.mode,
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
        files: form.files,
        handleFilesChange: form.handleFilesChange,
        showValidation: form.showValidation,
        validation: form.validation,
        estimatedCredits: form.estimatedCredits,
        isGenerating: runner.isGenerating,
        handleGenerate,
        results: runner.results,
        handleRetry,
        handleDownload: runner.download,
    };

    return (
        <>
            {layout === "project"
                ? <ProjectGenerator {...sharedProps} />
                : <DefaultGenerator {...sharedProps} handleCancel={runner.cancel} />}
            <GeneratorSettings
                open={form.settingsOpen}
                mode={form.mode}
                value={form.settings}
                splitMode={form.promptSplitMode}
                onSplitModeChange={form.setPromptSplitMode}
                onChange={form.setSettings}
                onClose={() => form.setSettingsOpen(false)}
                modelOptions={getModelOptions(form.catalog, form.mode)}
            />
        </>
    );
}
