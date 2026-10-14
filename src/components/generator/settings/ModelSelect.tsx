import { Check } from "lucide-react";
import type { ModelOption } from "@/features/generator/modelCatalog";

interface ModelSelectProps {
    options: ModelOption[];
    value: string;
    onChange: (value: string) => void;
}

export function ModelSelect({ options, value, onChange }: ModelSelectProps) {
    return (
        <div className="space-y-2">
            {options.map((model) => {
                const selected = value === model.value;
                return (
                    <button
                        key={model.value}
                        type="button"
                        onClick={() => onChange(model.value)}
                        className={`
                            flex w-full items-center gap-3 rounded-xl border p-3 text-left transition
                            ${selected
                                ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                                : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/50 hover:bg-[var(--app-surface-soft)]"
                            }
                        `}
                    >
                        <span
                            className={`
                                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
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
                                    block text-sm font-medium
                                    ${selected ? "text-[var(--app-accent)]" : "text-[var(--app-text)]"}
                                `}
                            >
                                {model.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                                {model.description}
                            </span>
                        </span>
                        <span className="shrink-0 text-[11px] font-medium text-[var(--app-text-muted)]">
                            {model.credits}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
