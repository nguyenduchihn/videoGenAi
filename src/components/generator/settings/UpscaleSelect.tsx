
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { upscaleOptions, type ModeKind } from "@/features/generator/modes";
import type { UpscaleChoice } from "../types";

interface UpscaleSelectProps {
    kind: ModeKind;
    value: UpscaleChoice;
    onChange: (value: UpscaleChoice) => void;
}

export default function UpscaleSelect({
    kind,
    value,
    onChange,
}: UpscaleSelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const labelId = useId();

    const options: { value: UpscaleChoice; label: string }[] = [
        { value: "none", label: "Không" },
        ...upscaleOptions(kind).map((resolution) => ({
            value: resolution,
            label: resolution,
        })),
    ];

    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative w-full min-w-0">
            <span id={labelId} className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--app-text-secondary)]">
                Upscale
            </span>

            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Upscale: ${selected?.label ?? "Không"}`}
                onClick={() => setOpen((current) => !current)}
                className={`flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] outline-none transition ${open
                        ? "border-[var(--app-accent)] ring-2 ring-[var(--app-accent)]/15"
                        : "border-[var(--app-border)] hover:border-[var(--app-accent)]/50"
                    }`}
            >
                <span className="truncate">
                    {selected?.label ?? "Không"}
                </span>

                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--app-text-secondary)] transition-transform ${open ? "rotate-180" : ""
                        }`}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Chọn độ phân giải Upscale"
                    className="absolute left-0 top-full z-50 mt-2 w-full min-w-[120px] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${isSelected
                                        ? "bg-[var(--app-accent-soft)] font-medium text-[var(--app-accent)]"
                                        : "text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
                                    }`}
                            >
                                <span>{option.label}</span>

                                {isSelected && (
                                    <Check
                                        className="h-4 w-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
