import GeneratorFooter from "../generatorFooter";
import GeneratorResult from "../generatorResult";
import GeneratorToolbar from "../generatorToolbar";
import ModeContent from "../modeContent";
import PromptEditor from "../promptEditor";
import type { GeneratorLayoutProps } from "./layoutProps";

export default function ProjectGenerator(props: GeneratorLayoutProps) {
    const { variant, mode, spec, settings, setSettings, prompt, jobs, attachments, results } = props;
    return (
        <div className="grid min-h-full grid-cols-1 lg:h-full lg:grid-cols-[30%_70%]">
            <section className="min-w-0 border-b border-[var(--app-border)] lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
                        singleJob={false}
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
                        stacked
                    />
                </div>
            </section>
            <section className="min-w-0 min-h-0 overflow-y-auto bg-[var(--app-surface)]">
                <div className="border-b border-[var(--app-border)] px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--app-text)]">Kết quả</h2>
                            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Ảnh và video được tạo trong project này</p>
                        </div>
                        {results.length > 0 && (
                            <span className="rounded-full bg-[var(--app-surface-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--app-text-secondary)]">{results.length} jobs</span>
                        )}
                    </div>
                </div>
                <div className="p-4 sm:p-6">
                    <GeneratorResult
                        results={results}
                        queueNotice={props.queueNotice}
                        onRetry={props.handleRetry}
                        onDownload={props.handleDownload}
                        onCancel={props.handleCancel}
                        onCancelAll={props.handleCancelAll}
                        onExtend={props.handleExtend}
                    />
                </div>
            </section>
        </div>
    );
}
