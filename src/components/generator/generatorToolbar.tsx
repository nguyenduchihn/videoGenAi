import { Settings } from "lucide-react";
import { toLabel } from "@/features/generator/modelCatalog";
import type { ModeSpec } from "@/features/generator/modes";
import AspectRatioSelector from "./aspectRatioSelector";
import ModeSelector from "./modeSelector";
import { DurationChips } from "./settings/DurationChips";
import UpscaleSelect from "./settings/UpscaleSelect";
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
    const hasRatio = Boolean(spec.settings.ratio);
    const hasSettingsButton = variant === "advanced";

    return (
        <div className="border-b border-[var(--app-border)] px-4 py-3 sm:px-5">
            <div
                className={[

                    "grid grid-cols-1 items-end gap-x-2 gap-y-3",
                    hasRatio
                        ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(120px,1fr)_minmax(120px,1fr)]"
                        : "lg:grid-cols-[minmax(0,1.6fr)_minmax(120px,1fr)]",
                    hasSettingsButton &&
                    (hasRatio
                        ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(120px,1fr)_minmax(120px,1fr)_36px]"
                        : "xl:grid-cols-[minmax(0,1.6fr)_minmax(120px,1fr)_36px]"),

                ].filter(Boolean).join(" ")}
            >
                <div className="min-w-0">
                    <ModeSelector
                        value={mode}
                        onChange={onModeChange}
                    />
                </div>

                {hasRatio && (
                    <div className="min-w-0">
                        <AspectRatioSelector
                            mode={mode}
                            value={aspectRatio}
                            onChange={onAspectRatioChange}
                        />
                    </div>
                )}

                <div className="min-w-0">
                    <UpscaleSelect
                        kind={spec.kind}
                        value={settings.upscale}
                        onChange={(upscale) => onSettingsChange({ upscale })}
                    />
                </div>

                {hasSettingsButton && (
                    <button
                        type="button"
                        onClick={onOpenSettings}
                        className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] transition hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] xl:flex"
                        aria-label="Cài đặt nâng cao"
                        title="Cài đặt nâng cao"
                    >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            {spec.settings.duration && (
                <div className="mt-4 min-w-0">
                    <DurationChips
                        value={settings.duration}
                        onChange={(duration) =>
                            onSettingsChange({ duration })
                        }
                    />
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-1 font-medium text-[var(--app-accent)]">
                    {variant === "quick" ? "Quick" : "Advanced"}
                </span>

                <span className="text-[var(--app-text-secondary)]">
                    Model:{" "}
                    <span className="font-medium text-[var(--app-text)]">
                        {toLabel(settings.model)}
                    </span>
                </span>

                {spec.settings.audio && (
                    <span className="text-[var(--app-text-secondary)]">
                        Audio: {settings.audioEnabled ? "bật" : "tắt"}
                    </span>
                )}
            </div>
        </div>
    );
}