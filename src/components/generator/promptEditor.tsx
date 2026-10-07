import { ChevronDown, List, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PromptSplitMode } from "./types";

interface PromptEditorProps {
    value: string;
    onChange: (value: string) => void;

    splitMode: PromptSplitMode;
    onSplitModeChange: (value: PromptSplitMode) => void;

    customSeparator: string;
    onCustomSeparatorChange: (value: string) => void;

    jobCount: number;
    singleJob?: boolean;
}

interface SplitOption {
    value: PromptSplitMode;
    label: string;
    description: string;
}

const SPLIT_OPTIONS: SplitOption[] = [
    {
        value: "newline",
        label: "Xuống dòng",
        description: "Mỗi dòng là một job",
    },
    {
        value: "blank-line",
        label: "Dòng trống",
        description: "Mỗi nhóm cách nhau bằng dòng trống",
    },
    {
        value: "separator",
        label: "====",
        description: "Phân tách bằng ==== ",
    },
    {
        value: "custom",
        label: "Tùy chỉnh",
        description: "Sử dụng ký tự phân tách riêng",
    },
];

function getPlaceholder(splitMode: PromptSplitMode) {
    switch (splitMode) {
        case "newline":
            return `Nhập prompt...
Mỗi dòng sẽ được tính là một job.`;

        case "blank-line":
            return `Nhập prompt 1

Nhập prompt 2

Mỗi nhóm cách nhau bằng một dòng trống.`;

        case "separator":
            return `Nhập prompt 1
====
Nhập prompt 2
====
Nhập prompt 3`;

        case "custom":
            return `Nhập prompt 1
===
Nhập prompt 2
===
Nhập prompt 3`;

        default:
            return "Nhập prompt...";
    }
}

export default function PromptEditor({
    value,
    onChange,
    splitMode,
    onSplitModeChange,
    customSeparator,
    onCustomSeparatorChange,
    jobCount,
    singleJob = false,
}: PromptEditorProps) {
    const [open, setOpen] = useState(false);

    const containerRef =
        useRef<HTMLDivElement>(null);

    const selectedOption =
        SPLIT_OPTIONS.find(
            (option) => option.value === splitMode,
        ) ?? SPLIT_OPTIONS[0];

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

    const handleSplitModeChange = (
        nextMode: PromptSplitMode,
    ) => {
        onSplitModeChange(nextMode);
        setOpen(false);
    };

    return (
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
            <div className="flex min-w-0 items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-[var(--app-accent)]" />

                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text)]">
                        {singleJob ? "Prompt" : "Prompts"}
                    </span>

                    <span className="rounded-full bg-[var(--app-surface-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--app-text-secondary)]">
                        {jobCount}{" "}
                        {jobCount === 1 ? "job" : "jobs"}
                    </span>
                </div>

                {!singleJob && (
                    <div
                        ref={containerRef}
                        className="relative min-w-0 flex-1"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setOpen((current) => !current)
                            }
                            className={`
                                flex h-9 w-full items-center
                                justify-between gap-3 rounded-lg
                                border px-3
                                text-left transition
                                ${open
                                    ? "border-[var(--app-accent)] bg-[var(--app-surface)] ring-1 ring-[var(--app-accent)]/20"
                                    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50"
                                }
                            `}
                            aria-haspopup="listbox"
                            aria-expanded={open}
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <List className="h-3.5 w-3.5 shrink-0 text-[var(--app-text-muted)]" />

                                <span className="truncate text-xs font-medium text-[var(--app-text)]">
                                    {selectedOption.label}
                                </span>
                            </span>

                            <ChevronDown
                                className={`
                                    h-3.5 w-3.5 shrink-0
                                    text-[var(--app-text-muted)]
                                    transition-transform
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
                                    absolute right-0 top-full z-50 mt-2
                                    w-full min-w-[250px]
                                    overflow-hidden rounded-xl
                                    border border-[var(--app-border)]
                                    bg-[var(--app-surface)] p-1.5
                                    shadow-xl
                                "
                                role="listbox"
                            >
                                {SPLIT_OPTIONS.map((option) => {
                                    const selected =
                                        option.value ===
                                        splitMode;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() =>
                                                handleSplitModeChange(
                                                    option.value,
                                                )
                                            }
                                            className={`
                                                flex w-full
                                                items-start gap-3
                                                rounded-lg px-3
                                                py-2.5 text-left
                                                transition
                                                ${selected
                                                    ? "bg-[var(--app-accent-soft)]"
                                                    : "hover:bg-[var(--app-surface-soft)]"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    mt-0.5 flex
                                                    h-7 w-7 shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-md text-xs
                                                    font-semibold
                                                    ${selected
                                                        ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                        : "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]"
                                                    }
                                                `}
                                            >
                                                {option.value ===
                                                    "custom"
                                                    ? "✦"
                                                    : option.label}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={`
                                                        block text-xs
                                                        font-medium
                                                        ${selected
                                                            ? "text-[var(--app-accent)]"
                                                            : "text-[var(--app-text)]"
                                                        }
                                                    `}
                                                >
                                                    {option.label}
                                                </span>

                                                <span className="mt-0.5 block text-[11px] leading-4 text-[var(--app-text-muted)]">
                                                    {option.description}
                                                </span>
                                            </span>

                                            {selected && (
                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-accent)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!singleJob && splitMode === "custom" && (
                <div className="border-b border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="prompt-custom-separator"
                                className="block text-xs font-medium text-[var(--app-text)]"
                            >
                                Ký tự phân tách
                            </label>

                            <p className="mt-0.5 text-[11px] text-[var(--app-text-muted)]">
                                Dùng chuỗi này để chia prompt
                                thành nhiều job.
                            </p>
                        </div>

                        <input
                            id="prompt-custom-separator"
                            type="text"
                            value={customSeparator}
                            onChange={(event) =>
                                onCustomSeparatorChange(
                                    event.target.value,
                                )
                            }
                            placeholder="==="
                            className="
                                h-9 w-full rounded-lg
                                border border-[var(--app-border)]
                                bg-[var(--app-surface)]
                                px-3 font-mono text-sm
                                text-[var(--app-text)]
                                outline-none transition
                                placeholder:text-[var(--app-text-muted)]
                                focus:border-[var(--app-accent)]
                                focus:ring-1
                                focus:ring-[var(--app-accent)]/20
                                sm:w-[160px]
                            "
                        />
                    </div>
                </div>
            )}

            <div className="relative">
                <textarea
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder={getPlaceholder(
                        splitMode,
                    )}
                    spellCheck={false}
                    className="
                        min-h-[180px] w-full resize-y
                        border-0 bg-transparent
                        px-4 py-4
                        text-sm leading-6
                        text-[var(--app-text)]
                        outline-none
                        placeholder:text-[var(--app-text-muted)]
                        focus:ring-0
                    "
                />

                <div className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-[var(--app-text-muted)]">
                    {value.length} ký tự
                </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--app-border)] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[11px] text-[var(--app-text-muted)]">
                    {singleJob
                        ? "Mỗi lần tạo sẽ tạo 1 job"
                        : selectedOption.description}
                </span>

                <span className="text-[11px] font-medium text-[var(--app-text-secondary)]">
                    {jobCount}{" "}
                    {jobCount === 1
                        ? "job sẵn sàng"
                        : "jobs sẵn sàng"}
                </span>
            </div>
        </div>
    );
}