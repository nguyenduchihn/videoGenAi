import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { MODES, modeSpec, modesOfKind, type ModeKind } from "@/features/generator/modes";
import type { GeneratorMode } from "./types";

interface ModeSelectorProps {
    value: GeneratorMode;
    onChange: (value: GeneratorMode) => void;
}

const GROUPS: { kind: ModeKind; title: string }[] = [
    { kind: "image", title: "Tạo ảnh" },
    { kind: "video", title: "Tạo video" },
];
const ORDERED = GROUPS.flatMap((group) => modesOfKind(group.kind));

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<GeneratorMode>(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const selected = modeSpec(value);
    const SelectedIcon = selected.icon;
    const optionId = (mode: GeneratorMode) => `${listId}-${mode}`;

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
        setActive(value);
        setOpen(true);
    };

    const close = (restoreFocus: boolean) => {
        setOpen(false);
        if (restoreFocus) triggerRef.current?.focus();
    };

    const select = (mode: GeneratorMode) => {
        onChange(mode);
        close(true);
    };

    const moveActive = (step: number) => {
        const index = ORDERED.findIndex((spec) => spec.value === active);
        const next = ORDERED[(index + step + ORDERED.length) % ORDERED.length];
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
            case "Home": event.preventDefault(); setActive(ORDERED[0]!.value); break;
            case "End": event.preventDefault(); setActive(ORDERED[ORDERED.length - 1]!.value); break;
            case "Enter":
            case " ": event.preventDefault(); select(active); break;
            case "Escape": event.preventDefault(); close(true); break;
            case "Tab": close(false); break;
            default: break;
        }
    };

    return (
        <div ref={containerRef} className="relative min-w-0">
            <span id={`${listId}-label`} className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--app-text-secondary)]">
                Chế độ
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
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                        <SelectedIcon className="h-4 w-4" aria-hidden="true" />
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
                    className="absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl outline-none"
                >
                    {GROUPS.map((group) => (
                        <div key={group.kind} role="group" aria-label={group.title}>
                            <div aria-hidden="true" className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                                {group.title}
                            </div>
                            {MODES.filter((spec) => spec.kind === group.kind).map((spec) => {
                                const isSelected = spec.value === value;
                                const isActive = spec.value === active;
                                const Icon = spec.icon;
                                return (
                                    <div
                                        key={spec.value}
                                        id={optionId(spec.value)}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => select(spec.value)}
                                        onMouseEnter={() => setActive(spec.value)}
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                            isSelected ? "bg-[var(--app-accent-soft)]" : isActive ? "bg-[var(--app-surface-soft)]" : ""
                                        }`}
                                    >
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-[var(--app-accent)]/15 text-[var(--app-accent)]" : "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]"}`}>
                                            <Icon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className={`block truncate text-sm font-medium ${isSelected ? "text-[var(--app-accent)]" : "text-[var(--app-text)]"}`}>{spec.label}</span>
                                            <span className="mt-0.5 block truncate text-[11px] text-[var(--app-text-muted)]">{spec.description}</span>
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
