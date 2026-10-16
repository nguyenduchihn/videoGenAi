import { Settings } from "lucide-react";
import { toLabel } from "@/features/generator/modelCatalog";
import type { ModeSpec } from "@/features/generator/modes";
import AspectRatioSelector from "./aspectRatioSelector";
import ModeSelector from "./modeSelector";
import { DurationChips } from "./settings/DurationChips";
import { UpscaleChips } from "./settings/UpscaleChips";
import type { GeneratorMode, GeneratorSettingsState } from "./types";

export interface GeneratorToolbarProps {
    variant: "quick" | "advanced";
    mode: GeneratorMode;
    spec: ModeSpec;
    aspectRatio: string;
    onAspectRatioChange: (value: string) => void;
    settings: GeneratorSettingsState;
    onSettingsChange: (patch: Partial<GeneratorSettingsState>) => void;
    onModeChange: (mode: GeneratorMode) => void;
    onOpenSettings: () => void;
}

/** Thanh chọn chế độ / tỷ lệ / thời lượng / upscale dùng chung cho hai layout. */
export default function GeneratorToolbar({
    variant,
    mode,
    spec,
    aspectRatio,
    onAspectRatioChange,
    settings,
    onSettingsChange,
    onModeChange,
    onOpenSettings,
}: GeneratorToolbarProps) {
    return (
        <div className="border-b border-[var(--app-border)] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
                <ModeSelector value={mode} onChange={onModeChange} />
                {spec.settings.ratio && <AspectRatioSelector mode={mode} value={aspectRatio} onChange={onAspectRatioChange} />}
                {variant === "advanced" && (
                    <button
                        type="button"
                        onClick={onOpenSettings}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-[var(--app-text-secondary)] transition hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] md:w-11"
                        aria-label="Cài đặt nâng cao"
                    >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
                {spec.settings.duration && (
                    <DurationChips value={settings.duration} onChange={(duration) => onSettingsChange({ duration })} />
                )}
                <UpscaleChips kind={spec.kind} value={settings.upscale} onChange={(upscale) => onSettingsChange({ upscale })} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-1 font-medium text-[var(--app-accent)]">
                    {variant === "quick" ? "Quick" : "Advanced"}
                </span>
                <span className="text-[var(--app-text-secondary)]">
                    Model: <span className="font-medium text-[var(--app-text)]">{toLabel(settings.model)}</span>
                </span>
                {spec.settings.audio && (
                    <span className="text-[var(--app-text-secondary)]">Audio: {settings.audioEnabled ? "bật" : "tắt"}</span>
                )}
            </div>
        </div>
    );
}
