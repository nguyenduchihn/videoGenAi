import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import type {
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "./types";
import type { ModelOption } from "@/features/generator/modelCatalog";
import { IMAGE_MODES, MODEL_OPTIONS } from "./settings/constants";
import { ModelSelect } from "./settings/ModelSelect";
import { NumberField } from "./settings/NumberField";
import { SplitModeSelect } from "./settings/SplitModeSelect";

interface GeneratorSettingsProps {
    open: boolean;
    mode: GeneratorMode;
    value: GeneratorSettingsState;
    splitMode: PromptSplitMode;
    onSplitModeChange: (value: PromptSplitMode) => void;
    onChange: (value: GeneratorSettingsState) => void;
    onClose: () => void;
    modelOptions?: ModelOption[];
}

function ToggleField({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-4 text-left"
        >
            <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--app-text)]">{label}</p>
                {description && (
                    <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">
                        {description}
                    </p>
                )}
            </div>
            <span
                className={`
                    relative h-6 w-11 shrink-0 rounded-full transition
                    ${checked ? "bg-[var(--app-accent)]" : "bg-[var(--app-border)]"}
                `}
            >
                <span
                    className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform
                        ${checked ? "translate-x-6" : "translate-x-1"}
                    `}
                />
            </span>
        </button>
    );
}

export default function GeneratorSettings({
    open,
    mode,
    value,
    splitMode,
    onSplitModeChange,
    onChange,
    onClose,
    modelOptions: modelOptionsProp,
}: GeneratorSettingsProps) {
    const [localValue, setLocalValue] = useState<GeneratorSettingsState>(value);
    const isImageMode = IMAGE_MODES.includes(mode);
    const modelOptions = modelOptionsProp ?? (isImageMode ? MODEL_OPTIONS.image : MODEL_OPTIONS.video);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (open) setLocalValue(value);
    }, [open, value]);

    if (!open) return null;

    const updateValue = (patch: Partial<GeneratorSettingsState>) => {
        const nextValue = { ...localValue, ...patch };
        setLocalValue(nextValue);
        onChange(nextValue);
    };

    const handleClose = () => {
        onChange(localValue);
        onClose();
    };

    return (
        <div
            className="
                fixed inset-0 z-[100] flex items-end justify-center
                bg-black/40 backdrop-blur-[2px] sm:items-center
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) handleClose();
            }}
        >
            <div
                className="
                    flex h-[100dvh] w-full flex-col overflow-hidden
                    bg-[var(--app-surface)] text-[var(--app-text)] transition-colors
                    sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl
                    sm:border sm:border-[var(--app-border)] sm:shadow-2xl
                "
                role="dialog"
                aria-modal="true"
                aria-labelledby="generator-settings-title"
            >
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--app-border)] px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                            <Settings className="h-4 w-4" />
                        </div>
                        <div>
                            <h2
                                id="generator-settings-title"
                                className="text-sm font-semibold text-[var(--app-text)]"
                            >
                                Cài đặt nâng cao
                            </h2>
                            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
                                Điều chỉnh thông số generator
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            flex h-9 w-9 items-center justify-center rounded-lg
                            text-[var(--app-text-muted)] transition
                            hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]
                        "
                        aria-label="Đóng cài đặt"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-6 p-4 sm:p-5">
                        <section>
                            <div className="mb-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">
                                    Model
                                </h3>
                            </div>
                            <ModelSelect
                                options={modelOptions}
                                value={localValue.model}
                                onChange={(model) => updateValue({ model })}
                            />
                        </section>

                        <section className="border-t border-[var(--app-border)] pt-6">
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">
                                    Batch & hiệu năng
                                </h3>
                            </div>
                            <div className="space-y-5">
                                <NumberField
                                    label="Số lượng song song"
                                    description="Số job được xử lý cùng lúc."
                                    value={localValue.parallel}
                                    min={1}
                                    max={32}
                                    suffix="luồng"
                                    onChange={(parallel) => updateValue({ parallel })}
                                />
                                <NumberField
                                    label="Nghỉ sau mỗi đợt"
                                    description="Thời gian chờ giữa các đợt xử lý."
                                    value={localValue.batchDelay}
                                    min={0}
                                    max={300}
                                    suffix="giây"
                                    onChange={(batchDelay) => updateValue({ batchDelay })}
                                />
                                <NumberField
                                    label={isImageMode ? "Số ảnh mỗi đợt" : "Số video mỗi đợt"}
                                    description="Số lượng job được gửi trong một đợt."
                                    value={localValue.burstSize}
                                    min={1}
                                    max={100}
                                    suffix="job"
                                    onChange={(burstSize) => updateValue({ burstSize })}
                                />
                            </div>
                        </section>

                        {!isImageMode && (
                            <section className="border-t border-[var(--app-border)] pt-6">
                                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                    <ToggleField
                                        label="Tạo audio cho video"
                                        description="Cho phép model tạo âm thanh cùng với video."
                                        checked={localValue.generateAudio}
                                        onChange={(generateAudio) =>
                                            updateValue({ generateAudio })
                                        }
                                    />
                                    <div className="mt-3">
                                        <span
                                            className={`
                                                inline-flex rounded-md px-2 py-1
                                                text-[11px] font-medium
                                                ${localValue.generateAudio
                                                    ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                    : "bg-[var(--app-surface)] text-[var(--app-text-muted)]"
                                                }
                                            `}
                                        >
                                            {localValue.generateAudio ? "Bật" : "Tắt"}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="border-t border-[var(--app-border)] pt-6">
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">
                                    Upscale
                                </h3>
                            </div>
                            <NumberField
                                label="Luồng Upscale ảnh"
                                description="Số luồng dùng để xử lý upscale."
                                value={localValue.upscaleThreads}
                                min={1}
                                max={16}
                                suffix="luồng"
                                onChange={(upscaleThreads) =>
                                    updateValue({ upscaleThreads })
                                }
                            />
                        </section>

                        <section className="border-t border-[var(--app-border)] pt-6">
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">
                                    Prompts
                                </h3>
                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                    Chọn cách chia nội dung thành nhiều job.
                                </p>
                            </div>
                            <SplitModeSelect
                                value={splitMode}
                                onChange={onSplitModeChange}
                                customSeparator={localValue.customSeparator}
                                onCustomSeparatorChange={(customSeparator) =>
                                    updateValue({ customSeparator })
                                }
                            />
                        </section>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-center text-[11px] text-[var(--app-text-muted)] sm:text-left">
                        Thay đổi được áp dụng ngay vào Generator.
                    </p>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            inline-flex h-10 w-full items-center justify-center
                            rounded-xl bg-[var(--app-accent)] px-5 text-sm
                            font-semibold text-white transition
                            hover:bg-[var(--app-accent-hover)] sm:w-auto
                        "
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
}
