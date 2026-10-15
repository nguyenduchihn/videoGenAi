import GeneratorFooter from "../generatorFooter";
import GeneratorResult from "../generatorResult";
import GeneratorToolbar from "../generatorToolbar";
import ModeContent from "../modeContent";
import PromptEditor from "../promptEditor";
import type { GeneratorLayoutProps } from "./layoutProps";

export default function DefaultGenerator(props: GeneratorLayoutProps) {
    const { variant, mode, spec, settings, setSettings, prompt, jobs, attachments, results } = props;
    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
                <GeneratorToolbar
                    variant={variant}
                    mode={mode}
                    spec={spec}
                    aspectRatio={props.aspectRatio}
                    onAspectRatioChange={props.setAspectRatio}
                    settings={settings}
                    onSettingsChange={(patch) => setSettings((current) => ({ ...current, ...patch }))}
                    onModeChange={props.handleModeChange}
                    onOpenSettings={() => props.setSettingsOpen(true)}
                />
                <div className="p-4 sm:p-5">
                    <PromptEditor
                        value={prompt}
                        onChange={props.setPrompt}
                        splitMode={props.promptSplitMode}
                        onSplitModeChange={props.setPromptSplitMode}
                        customSeparator={settings.customSeparator}
                        onCustomSeparatorChange={(value: string) => setSettings((current) => ({ ...current, customSeparator: value }))}
                        jobCount={jobs.length}
                        singleJob={variant === "quick"}
                    />

                    <ModeContent
                        mode={mode}
                        attachments={attachments}
                        model={settings.model}
                        jobCount={jobs.length}
                        sessionVideos={props.sessionVideos}
                        onChange={props.updateAttachments}
                    />

                    <GeneratorFooter
                        spec={spec}
                        jobCount={jobs.length}
                        estimatedCredits={props.estimatedCredits}
                        balance={props.balance}
                        validation={props.validation}
                        showValidation={props.showValidation}
                        submitError={props.submitError}
                        isGenerating={props.isGenerating}
                        uploadProgress={props.uploadProgress}
                        onGenerate={props.handleGenerate}
                    />
                </div>
            </section>

            <GeneratorResult
                results={results}
                queueNotice={props.queueNotice}
                onRetry={props.handleRetry}
                onDownload={props.handleDownload}
                onCancel={props.handleCancel}
                onCancelAll={props.handleCancelAll}
                onExtend={props.handleExtend}
            />
        </>
    );
}
