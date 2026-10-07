import { ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GeneratorMode } from "./types";


interface ModeSelectorProps {
    value: GeneratorMode;
    onChange: (value: GeneratorMode) => void;
}

interface ModeOption {
    value: GeneratorMode;
    label: string;
    icon: string;
    description: string;
}

const MODE_OPTIONS: ModeOption[] = [
    {
        value: "text-to-video",
        label: "Văn bản (T2V)",
        icon: "🎬",
        description: "Tạo video từ mô tả văn bản",
    },
    {
        value: "image-to-video",
        label: "Khung hình (I2V)",
        icon: "🖼️",
        description: "Tạo video từ khung hình",
    },
    {
        value: "components",
        label: "Thành phần",
        icon: "🧩",
        description: "Tạo video từ các thành phần tham chiếu",
    },
    {
        value: "text-to-image",
        label: "Tạo ảnh (T2I)",
        icon: "🎨",
        description: "Tạo ảnh từ mô tả văn bản",
    },
    {
        value: "batch-image",
        label: "Ảnh hàng loạt (fix + động)",
        icon: "🖼️",
        description: "Tạo ảnh theo danh sách hàng loạt",
    },
    {
        value: "reference-video-voice",
        label: "Reference Video + Voice",
        icon: "🎥",
        description: "Tạo video từ video và giọng nói tham chiếu",
    },
    {
        value: "batch-reference",
        label: "Reference hàng loạt (R2V)",
        icon: "🎞️",
        description: "Tạo video từ nhiều reference",
    },
];

export default function ModeSelector({
    value,
    onChange,
}: ModeSelectorProps) {
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const selectedMode =
        MODE_OPTIONS.find(
            (option) => option.value === value,
        ) ?? MODE_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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

    const handleSelect = (mode: GeneratorMode) => {
        onChange(mode);
        setOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative min-w-0"
        >
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Chế độ
            </label>


            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`
                    flex h-11 w-full items-center justify-between
                    rounded-xl border bg-white px-3
                    text-left transition
                    ${open
                        ? "border-violet-500 ring-1 ring-violet-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }
                `}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-base">
                        {selectedMode.icon}
                    </span>

                    <span className="truncate text-sm font-medium text-gray-800">
                        {selectedMode.label}
                    </span>
                </span>

                <ChevronDown
                    className={`
                        ml-2 h-4 w-4 shrink-0 text-gray-400
                        transition-transform duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 top-full z-50 mt-2 w-full
                        overflow-hidden rounded-xl border border-gray-200
                        bg-white p-1.5 shadow-xl shadow-gray-200/50
                    "
                    role="listbox"
                >
                    {MODE_OPTIONS.map((option) => {
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
                                    flex w-full items-center gap-3
                                    rounded-lg px-3 py-2.5
                                    text-left transition
                                    ${selected
                                        ? "bg-violet-50"
                                        : "hover:bg-gray-50"
                                    }
                                `}
                            >
                                {/* Icon */}
                                <span
                                    className={`
                                        flex h-8 w-8 shrink-0
                                        items-center justify-center
                                        rounded-lg text-base
                                        ${selected
                                            ? "bg-violet-100"
                                            : "bg-gray-50"
                                        }
                                    `}
                                >
                                    {option.icon}
                                </span>

                                {/* Text */}
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`
                                            block truncate text-sm font-medium
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