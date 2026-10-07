import {
    Check,
    Minus,
    Plus,
    Settings,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import type {
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "./types";

interface GeneratorSettingsProps {
    open: boolean;
    mode: GeneratorMode;
    value: GeneratorSettingsState;
    splitMode: PromptSplitMode;
    onSplitModeChange: (
        value: PromptSplitMode,
    ) => void;
    onChange: (
        value: GeneratorSettingsState,
    ) => void;
    onClose: () => void;
}

interface NumberFieldProps {
    label: string;
    description?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    onChange: (value: number) => void;
}

const IMAGE_MODES: GeneratorMode[] = [
    "text-to-image",
    "batch-image",
];

const MODEL_OPTIONS = {
    video: [
        {
            value: "veo-3.1-lite",
            label: "Veo 3.1 - Lite",
            description:
                "Tạo video nhanh, tối ưu chi phí",
            credits: "5 credits",
        },
    ],
    image: [
        {
            value: "nano-banana-2-lite",
            label: "Nano Banana 2 Lite",
            description:
                "Tạo ảnh nhanh với chất lượng cao",
            credits: "1 credit",
        },
    ],
};

const SPLIT_OPTIONS: {
    value: PromptSplitMode;
    label: string;
}[] = [
        {
            value: "newline",
            label: "Xuống dòng",
        },
        {
            value: "blank-line",
            label: "Dòng trống",
        },
        {
            value: "separator",
            label: "====",
        },
        {
            value: "custom",
            label: "Tùy chỉnh",
        },
    ];

function NumberField({
    label,
    description,
    value,
    min = 0,
    max = 999,
    step = 1,
    suffix,
    onChange,
}: NumberFieldProps) {
    const decrease = () => {
        onChange(
            Math.max(
                min,
                Number(
                    (
                        value - step
                    ).toFixed(2),
                ),
            ),
        );
    };

    const increase = () => {
        onChange(
            Math.min(
                max,
                Number(
                    (
                        value + step
                    ).toFixed(2),
                ),
            ),
        );
    };

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--app-text)]">
                    {label}
                </p>

                {description && (
                    <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <div className="flex h-10 items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <button
                        type="button"
                        onClick={decrease}
                        disabled={
                            value <= min
                        }
                        className="
                            flex h-full w-9
                            items-center
                            justify-center
                            rounded-l-lg
                            text-[var(--app-text-muted)]
                            transition
                            hover:bg-[var(--app-surface-soft)]
                            hover:text-[var(--app-text)]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        aria-label={`Giảm ${label}`}
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>

                    <input
                        type="number"
                        value={value}
                        min={min}
                        max={max}
                        step={step}
                        onChange={(event) => {
                            const next =
                                Number(
                                    event
                                        .target
                                        .value,
                                );

                            if (
                                Number.isNaN(
                                    next,
                                )
                            ) {
                                return;
                            }

                            onChange(
                                Math.min(
                                    max,
                                    Math.max(
                                        min,
                                        next,
                                    ),
                                ),
                            );
                        }}
                        className="
                            h-full w-16
                            border-x
                            border-[var(--app-border)]
                            bg-transparent
                            px-1
                            text-center
                            text-sm
                            font-medium
                            text-[var(--app-text)]
                            outline-none
                            [appearance:textfield]
                            [&::-webkit-inner-spin-button]:appearance-none
                            [&::-webkit-outer-spin-button]:appearance-none
                        "
                    />

                    <button
                        type="button"
                        onClick={increase}
                        disabled={
                            value >= max
                        }
                        className="
                            flex h-full w-9
                            items-center
                            justify-center
                            rounded-r-lg
                            text-[var(--app-text-muted)]
                            transition
                            hover:bg-[var(--app-surface-soft)]
                            hover:text-[var(--app-text)]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        aria-label={`Tăng ${label}`}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>

                {suffix && (
                    <span className="w-14 text-xs text-[var(--app-text-muted)]">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
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
    onChange: (
        value: boolean,
    ) => void;
}) {
    return (
        <button
            type="button"
            onClick={() =>
                onChange(!checked)
            }
            className="flex w-full items-center justify-between gap-4 text-left"
        >
            <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--app-text)]">
                    {label}
                </p>

                {description && (
                    <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">
                        {description}
                    </p>
                )}
            </div>

            <span
                className={`
                    relative h-6 w-11
                    shrink-0 rounded-full
                    transition
                    ${checked
                        ? "bg-[var(--app-accent)]"
                        : "bg-[var(--app-border)]"
                    }
                `}
            >
                <span
                    className={`
                        absolute top-1
                        h-4 w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        ${checked
                            ? "translate-x-6"
                            : "translate-x-1"
                        }
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
}: GeneratorSettingsProps) {
    const [
        localValue,
        setLocalValue,
    ] =
        useState<GeneratorSettingsState>(
            value,
        );

    const isImageMode =
        IMAGE_MODES.includes(mode);

    const modelOptions =
        isImageMode
            ? MODEL_OPTIONS.image
            : MODEL_OPTIONS.video;

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            setLocalValue(value);
        }
    }, [open, value]);

    if (!open) {
        return null;
    }

    const updateValue = (
        patch: Partial<GeneratorSettingsState>,
    ) => {
        const nextValue = {
            ...localValue,
            ...patch,
        };

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
                fixed inset-0 z-[100]
                flex items-end
                justify-center
                bg-black/40
                backdrop-blur-[2px]
                sm:items-center
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleClose();
                }
            }}
        >
            <div
                className="
                    flex h-[100dvh] w-full
                    flex-col overflow-hidden
                    bg-[var(--app-surface)]
                    text-[var(--app-text)]
                    transition-colors
                    sm:h-auto
                    sm:max-h-[90vh]
                    sm:max-w-[560px]
                    sm:rounded-2xl
                    sm:border
                    sm:border-[var(--app-border)]
                    sm:shadow-2xl
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
                                Điều chỉnh thông số
                                generator
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            flex h-9 w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--app-text-muted)]
                            transition
                            hover:bg-[var(--app-surface-soft)]
                            hover:text-[var(--app-text)]
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

                            <div className="space-y-2">
                                {modelOptions.map(
                                    (model) => {
                                        const selected =
                                            localValue.model ===
                                            model.value;

                                        return (
                                            <button
                                                key={
                                                    model.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    updateValue(
                                                        {
                                                            model:
                                                                model.value,
                                                        },
                                                    )
                                                }
                                                className={`
                                                    flex w-full
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    border
                                                    p-3
                                                    text-left
                                                    transition
                                                    ${selected
                                                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                                                        : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)]"
                                                    }
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        ${selected
                                                            ? "bg-[var(--app-accent)] text-white"
                                                            : "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]"
                                                        }
                                                    `}
                                                >
                                                    {selected ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <span className="h-2 w-2 rounded-full bg-current" />
                                                    )}
                                                </span>

                                                <span className="min-w-0 flex-1">
                                                    <span
                                                        className={`
                                                            block text-sm
                                                            font-medium
                                                            ${selected
                                                                ? "text-[var(--app-accent)]"
                                                                : "text-[var(--app-text)]"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            model.label
                                                        }
                                                    </span>

                                                    <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                                                        {
                                                            model.description
                                                        }
                                                    </span>
                                                </span>

                                                <span className="shrink-0 text-[11px] font-medium text-[var(--app-text-muted)]">
                                                    {
                                                        model.credits
                                                    }
                                                </span>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
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
                                    value={
                                        localValue.parallel
                                    }
                                    min={1}
                                    max={32}
                                    suffix="luồng"
                                    onChange={(
                                        parallel,
                                    ) =>
                                        updateValue(
                                            {
                                                parallel,
                                            },
                                        )
                                    }
                                />

                                <NumberField
                                    label="Nghỉ sau mỗi đợt"
                                    description="Thời gian chờ giữa các đợt xử lý."
                                    value={
                                        localValue.batchDelay
                                    }
                                    min={0}
                                    max={300}
                                    suffix="giây"
                                    onChange={(
                                        batchDelay,
                                    ) =>
                                        updateValue(
                                            {
                                                batchDelay,
                                            },
                                        )
                                    }
                                />

                                <NumberField
                                    label={
                                        isImageMode
                                            ? "Số ảnh mỗi đợt"
                                            : "Số video mỗi đợt"
                                    }
                                    description="Số lượng job được gửi trong một đợt."
                                    value={
                                        localValue.burstSize
                                    }
                                    min={1}
                                    max={100}
                                    suffix="job"
                                    onChange={(
                                        burstSize,
                                    ) =>
                                        updateValue(
                                            {
                                                burstSize,
                                            },
                                        )
                                    }
                                />
                            </div>
                        </section>

                        {!isImageMode && (
                            <section className="border-t border-[var(--app-border)] pt-6">
                                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                    <ToggleField
                                        label="Tạo audio cho video"
                                        description="Cho phép model tạo âm thanh cùng với video."
                                        checked={
                                            localValue.generateAudio
                                        }
                                        onChange={(
                                            generateAudio,
                                        ) =>
                                            updateValue(
                                                {
                                                    generateAudio,
                                                },
                                            )
                                        }
                                    />

                                    <div className="mt-3">
                                        <span
                                            className={`
                                                inline-flex
                                                rounded-md
                                                px-2 py-1
                                                text-[11px]
                                                font-medium
                                                ${localValue.generateAudio
                                                    ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                    : "bg-[var(--app-surface)] text-[var(--app-text-muted)]"
                                                }
                                            `}
                                        >
                                            {localValue.generateAudio
                                                ? "Bật"
                                                : "Tắt"}
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
                                value={
                                    localValue.upscaleThreads
                                }
                                min={1}
                                max={16}
                                suffix="luồng"
                                onChange={(
                                    upscaleThreads,
                                ) =>
                                    updateValue(
                                        {
                                            upscaleThreads,
                                        },
                                    )
                                }
                            />
                        </section>

                        <section className="border-t border-[var(--app-border)] pt-6">
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">
                                    Prompts
                                </h3>

                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                    Chọn cách chia nội dung
                                    thành nhiều job.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {SPLIT_OPTIONS.map(
                                    (option) => {
                                        const selected =
                                            splitMode ===
                                            option.value;

                                        return (
                                            <button
                                                key={
                                                    option.value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    onSplitModeChange(
                                                        option.value,
                                                    )
                                                }
                                                className={`
                                                    flex min-h-10
                                                    items-center
                                                    justify-between
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    text-left
                                                    transition
                                                    ${selected
                                                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)]"
                                                    }
                                                `}
                                            >
                                                <span className="text-xs font-medium">
                                                    {
                                                        option.label
                                                    }
                                                </span>

                                                {selected && (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        );
                                    },
                                )}
                            </div>

                            {splitMode ===
                                "custom" && (
                                    <div className="mt-3">
                                        <label
                                            htmlFor="settings-custom-separator"
                                            className="mb-1.5 block text-xs font-medium text-[var(--app-text-secondary)]"
                                        >
                                            Ký tự phân tách
                                        </label>

                                        <input
                                            id="settings-custom-separator"
                                            type="text"
                                            value={
                                                localValue.customSeparator
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateValue(
                                                    {
                                                        customSeparator:
                                                            event
                                                                .target
                                                                .value,
                                                    },
                                                )
                                            }
                                            placeholder="==="
                                            className="
                                            h-10 w-full
                                            rounded-lg
                                            border
                                            border-[var(--app-border)]
                                            bg-[var(--app-surface)]
                                            px-3
                                            font-mono
                                            text-sm
                                            text-[var(--app-text)]
                                            outline-none
                                            transition
                                            placeholder:text-[var(--app-text-muted)]
                                            focus:border-[var(--app-accent)]
                                            focus:ring-1
                                            focus:ring-[var(--app-accent)]/20
                                        "
                                        />
                                    </div>
                                )}
                        </section>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-center text-[11px] text-[var(--app-text-muted)] sm:text-left">
                        Thay đổi được áp dụng ngay
                        vào Generator.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            inline-flex h-10
                            w-full
                            items-center
                            justify-center
                            rounded-xl
                            bg-[var(--app-accent)]
                            px-5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[var(--app-accent-hover)]
                            sm:w-auto
                        "
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
}