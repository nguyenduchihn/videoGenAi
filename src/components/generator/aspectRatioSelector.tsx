import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { modeSpec } from "@/features/generator/modes";
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
    /** Kích thước icon xem trước (h/w cố định để không tràn ô 28 px). */
    iconClass: string;
}

const VIDEO_RATIOS: AspectRatioOption[] = [
    { value: "16:9", label: "16:9", description: "Ngang · YouTube", iconClass: "h-3 w-5" },
    { value: "9:16", label: "9:16", description: "Dọc · TikTok / Reels", iconClass: "h-5 w-3" },
];

const IMAGE_RATIOS: AspectRatioOption[] = [
    { value: "1:1", label: "1:1", description: "Vuông", iconClass: "h-4 w-4" },
    { value: "3:4", label: "3:4", description: "Dọc · Portrait", iconClass: "h-4 w-3" },
    { value: "4:3", label: "4:3", description: "Ngang · Standard", iconClass: "h-3 w-4" },
    { value: "16:9", label: "16:9", description: "Ngang · Widescreen", iconClass: "h-3 w-5" },
    { value: "9:16", label: "9:16", description: "Dọc · Portrait", iconClass: "h-5 w-3" },
];

function getRatioOptions(mode: GeneratorMode): AspectRatioOption[] {
    return modeSpec(mode).kind === "image" ? IMAGE_RATIOS : VIDEO_RATIOS;
}

function RatioIcon({ option, accent }: { option: AspectRatioOption; accent: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={`block rounded-[2px] border-2 ${option.iconClass} ${accent ? "border-[var(--app-accent)]" : "border-[var(--app-text-secondary)]"}`}
        />
    );
}

export default function AspectRatioSelector({ mode, value, onChange }: AspectRatioSelectorProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const options = getRatioOptions(mode);
    const selected = options.find((option) => option.value === value) ?? options[0]!;
    const optionId = (ratio: string) => `${listId}-${ratio.replace(":", "-")}`;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) listRef.current?.focus();
    }, [open]);

    const openList = () => {
        setActive(selected.value);
        setOpen(true);
    };

    const close = (restoreFocus: boolean) => {
        setOpen(false);
        if (restoreFocus) triggerRef.current?.focus();
    };

    const select = (ratio: string) => {
        onChange(ratio);
        close(true);
    };

    const moveActive = (step: number) => {
        const index = options.findIndex((option) => option.value === active);
        const next = options[(index + step + options.length) % options.length];
        if (next) setActive(next.value);
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openList();
        }
    };

    const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case "ArrowDown": event.preventDefault(); moveActive(1); break;
            case "ArrowUp": event.preventDefault(); moveActive(-1); break;
            case "Home": event.preventDefault(); setActive(options[0]!.value); break;
            case "End": event.preventDefault(); setActive(options[options.length - 1]!.value); break;
            case "Enter":
            case " ": event.preventDefault(); select(active); break;
            case "Escape": event.preventDefault(); close(true); break;
            case "Tab": close(false); break;
            default: break;
        }
    };

    return (
        <div ref={containerRef} className="relative min-w-0 md:w-44">
            <span id={`${listId}-label`} className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--app-text-secondary)]">
                Tỷ lệ
            </span>

            <button
                ref={triggerRef}
                type="button"
                onClick={() => (open ? close(false) : openList())}
                onKeyDown={handleTriggerKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-labelledby={`${listId}-label ${listId}-value`}
                className={`flex h-11 w-full items-center justify-between rounded-xl border bg-[var(--app-surface)] px-3 text-left transition ${
                    open ? "border-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/20" : "border-[var(--app-border)] hover:border-[var(--app-accent)]/50"
                }`}
            >
                <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)]">
                        <RatioIcon option={selected} accent={false} />
                    </span>
                    <span id={`${listId}-value`} className="truncate text-sm font-medium text-[var(--app-text)]">{selected.label}</span>
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-[var(--app-text-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            {open && (
                <div
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    tabIndex={-1}
                    aria-labelledby={`${listId}-label`}
                    aria-activedescendant={optionId(active)}
                    onKeyDown={handleListKeyDown}
                    className="absolute left-0 top-full z-50 mt-2 w-full min-w-[230px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl outline-none"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        const isActive = option.value === active;
                        return (
                            <div
                                key={option.value}
                                id={optionId(option.value)}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => select(option.value)}
                                onMouseEnter={() => setActive(option.value)}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                    isSelected ? "bg-[var(--app-accent-soft)]" : isActive ? "bg-[var(--app-surface-soft)]" : ""
                                }`}
                            >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-[var(--app-accent)]/15" : "bg-[var(--app-surface-soft)]"}`}>
                                    <RatioIcon option={option} accent={isSelected} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-sm font-medium ${isSelected ? "text-[var(--app-accent)]" : "text-[var(--app-text)]"}`}>{option.label}</span>
                                    <span className="mt-0.5 block truncate text-[11px] text-[var(--app-text-muted)]">{option.description}</span>
                                </span>
                                {isSelected && <Check className="h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
