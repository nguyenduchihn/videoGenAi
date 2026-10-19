import GeneratorFooter from "../generatorFooter";
import GeneratorToolbar from "../generatorToolbar";
import ModeContent from "../modeContent";
import PromptEditor from "../promptEditor";
import type { GeneratorLayoutProps } from "./layoutProps";

export default function DefaultGenerator(props: GeneratorLayoutProps) {
    const { mode, spec, settings, setSettings, prompt, jobs, attachments } = props;
    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm" aria-label="Trình tạo">
            <GeneratorToolbar
                variant="advanced"
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
                <ModeContent mode={mode} attachments={attachments} model={settings.model} jobCount={jobs.length} onChange={props.updateAttachments} />
                <GeneratorFooter
                    spec={spec}
                    jobCount={jobs.length}
                    estimatedCredits={props.estimatedCredits}
                    balance={props.balance}
                    fairUse={props.fairUse}
                    validation={props.validation}
                    showValidation={props.showValidation}
                    submitError={props.submitError}
                    isGenerating={props.isGenerating}
                    uploadProgress={props.uploadProgress}
                    sendProgress={props.sendProgress}
                    onGenerate={props.handleGenerate}
                />
            </div>
        </section>
    );
}
