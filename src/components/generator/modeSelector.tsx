import { Check, ChevronDown } from "lucide-react";
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
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--app-text-secondary)]">
                Chế độ
            </label>

            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`
                    flex h-11 w-full items-center justify-between
                    rounded-xl border bg-[var(--app-surface)] px-3
                    text-left transition
                    ${open
                        ? "border-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/20"
                        : "border-[var(--app-border)] hover:border-[var(--app-accent)]/50"
                    }
                `}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-base">
                        {selectedMode.icon}
                    </span>

                    <span className="truncate text-sm font-medium text-[var(--app-text)]">
                        {selectedMode.label}
                    </span>
                </span>

                <ChevronDown
                    className={`
                        ml-2 h-4 w-4 shrink-0
                        text-[var(--app-text-muted)]
                        transition-transform duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 top-full z-50 mt-2 w-full
                        overflow-hidden rounded-xl
                        border border-[var(--app-border)]
                        bg-[var(--app-surface)]
                        p-1.5 shadow-xl
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
                                        ? "bg-[var(--app-accent-soft)]"
                                        : "hover:bg-[var(--app-surface-soft)]"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        flex h-8 w-8 shrink-0
                                        items-center justify-center
                                        rounded-lg text-base
                                        ${selected
                                            ? "bg-[var(--app-accent-soft)]"
                                            : "bg-[var(--app-surface-soft)]"
                                        }
                                    `}
                                >
                                    {option.icon}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`
                                            block truncate text-sm font-medium
                                            ${selected
                                                ? "text-[var(--app-accent)]"
                                                : "text-[var(--app-text)]"
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </span>

                                    <span className="mt-0.5 block truncate text-[11px] text-[var(--app-text-muted)]">
                                        {option.description}
                                    </span>
                                </span>

                                {selected && (
                                    <Check className="h-4 w-4 shrink-0 text-[var(--app-accent)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}