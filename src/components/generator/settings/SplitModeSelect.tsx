import { Check } from "lucide-react";
import type { PromptSplitMode } from "../types";
import { SPLIT_OPTIONS } from "./constants";

interface SplitModeSelectProps {
    value: PromptSplitMode;
    onChange: (value: PromptSplitMode) => void;
    customSeparator: string;
    onCustomSeparatorChange: (value: string) => void;
}

export function SplitModeSelect({
    value,
    onChange,
    customSeparator,
    onCustomSeparatorChange,
}: SplitModeSelectProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                {SPLIT_OPTIONS.map((option) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`
                                flex min-h-10 items-center justify-between rounded-lg
                                border px-3 text-left transition
                                ${selected
                                    ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                    : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)]"
                                }
                            `}
                        >
                            <span className="text-xs font-medium">{option.label}</span>
                            {selected && <Check className="h-3.5 w-3.5" />}
                        </button>
                    );
                })}
            </div>
            {value === "custom" && (
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
                        value={customSeparator}
                        onChange={(event) =>
                            onCustomSeparatorChange(event.target.value)
                        }
                        placeholder="==="
                        className="
                            h-10 w-full rounded-lg border border-[var(--app-border)]
                            bg-[var(--app-surface)] px-3 font-mono text-sm
                            text-[var(--app-text)] outline-none transition
                            placeholder:text-[var(--app-text-muted)]
                            focus:border-[var(--app-accent)]
                            focus:ring-1 focus:ring-[var(--app-accent)]/20
                        "
                    />
                </div>
            )}
        </>
    );
}
