import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { GeneratorMode } from "./types";

interface AspectRatioSelectorProps {
    mode: GeneratorMode;
    value: string;
    onChange: (value: string) => void;
}

interface AspectRatioOption {
    value: string;
    label: string;
    description: string;
}

const VIDEO_RATIOS: AspectRatioOption[] = [
    {
        value: "16:9",
        label: "16:9",
        description: "Ngang · YouTube",
    },
    {
        value: "9:16",
        label: "9:16",
        description: "Dọc · TikTok / Reels",
    },
];

const IMAGE_RATIOS: AspectRatioOption[] = [
    {
        value: "1:1",
        label: "1:1",
        description: "Vuông",
    },
    {
        value: "3:4",
        label: "3:4",
        description: "Dọc · Portrait",
    },
    {
        value: "4:3",
        label: "4:3",
        description: "Ngang · Standard",
    },
    {
        value: "16:9",
        label: "16:9",
        description: "Ngang · Widescreen",
    },
    {
        value: "9:16",
        label: "9:16",
        description: "Dọc · Portrait",
    },
];

const IMAGE_MODES: GeneratorMode[] = [
    "text-to-image",
    "batch-image",
];

function getRatioOptions(
    mode: GeneratorMode,
): AspectRatioOption[] {
    if (IMAGE_MODES.includes(mode)) {
        return IMAGE_RATIOS;
    }

    return VIDEO_RATIOS;
}

function getRatioPreviewClass(ratio: string) {
    switch (ratio) {
        case "1:1":
            return "aspect-square";

        case "3:4":
            return "aspect-[3/4]";

        case "4:3":
            return "aspect-[4/3]";

        case "16:9":
            return "aspect-video";

        case "9:16":
            return "aspect-[9/16]";

        default:
            return "aspect-video";
    }
}

export default function AspectRatioSelector({
    mode,
    value,
    onChange,
}: AspectRatioSelectorProps) {
    const [open, setOpen] = useState(false);

    const containerRef =
        useRef<HTMLDivElement>(null);

    const options = getRatioOptions(mode);

    const selectedRatio =
        options.find(
            (option) => option.value === value,
        ) ?? options[0];

    useEffect(() => {
        const isCurrentValueValid = options.some(
            (option) => option.value === value,
        );

        if (!isCurrentValueValid && options[0]) {
            onChange(options[0].value);
        }

        setOpen(false);
    }, [mode]);

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent,
        ) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    const handleSelect = (ratio: string) => {
        onChange(ratio);
        setOpen(false);
    };

    if (!selectedRatio) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="relative min-w-0"
        >
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Tỷ lệ
            </label>

            <button
                type="button"
                onClick={() =>
                    setOpen((current) => !current)
                }
                className={`
                    flex h-11 w-full items-center
                    justify-between rounded-xl border
                    bg-white px-3 text-left transition
                    ${open
                        ? "border-violet-500 ring-1 ring-violet-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }
                `}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-1.5">
                        <span
                            className={`
                                block w-full rounded-[2px]
                                border border-gray-500
                                ${getRatioPreviewClass(selectedRatio.value)}
                            `}
                        />
                    </span>

                    <span className="truncate text-sm font-medium text-gray-800">
                        {selectedRatio.label}
                    </span>
                </span>

                <ChevronDown
                    className={`
                        ml-2 h-4 w-4 shrink-0
                        text-gray-400 transition-transform
                        duration-200
                        ${open
                            ? "rotate-180"
                            : ""
                        }
                    `}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 top-full z-50 mt-2
                        w-full min-w-[230px]
                        overflow-hidden rounded-xl
                        border border-gray-200 bg-white
                        p-1.5 shadow-xl
                        shadow-gray-200/50
                    "
                    role="listbox"
                >
                    {options.map((option) => {
                        const selected =
                            option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() =>
                                    handleSelect(
                                        option.value,
                                    )
                                }
                                className={`
                                    flex w-full items-center
                                    gap-3 rounded-lg px-3 py-2.5
                                    text-left transition
                                    ${selected
                                        ? "bg-violet-50"
                                        : "hover:bg-gray-50"
                                    }
                                `}
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                    <span
                                        className={`
                                            block rounded-[2px]
                                            border
                                            ${selected
                                                ? "border-violet-500"
                                                : "border-gray-500"
                                            }
                                            ${getRatioPreviewClass(
                                                option.value,
                                            )}
                                            ${option.value ===
                                                "9:16"
                                                ? "h-6 w-3"
                                                : option.value ===
                                                    "16:9"
                                                    ? "h-3 w-6"
                                                    : option.value ===
                                                        "3:4"
                                                        ? "h-5 w-4"
                                                        : option.value ===
                                                            "4:3"
                                                            ? "h-4 w-5"
                                                            : "h-5 w-5"
                                            }
                                        `}
                                    />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`
                                            block text-sm
                                            font-medium
                                            ${selected
                                                ? "text-violet-700"
                                                : "text-gray-800"
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                                        {option.description}
                                    </span>
                                </span>

                                {selected && (
                                    <Check className="h-4 w-4 shrink-0 text-violet-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}