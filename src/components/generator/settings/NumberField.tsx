import { Minus, Plus } from "lucide-react";

export interface NumberFieldProps {
    label: string;
    description?: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    onChange: (value: number) => void;
}

export function NumberField({
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
        onChange(Math.max(min, Number((value - step).toFixed(2))));
    };

    const increase = () => {
        onChange(Math.min(max, Number((value + step).toFixed(2))));
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
                        disabled={value <= min}
                        className="
                            flex h-full w-9 items-center justify-center rounded-l-lg
                            text-[var(--app-text-muted)] transition
                            hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]
                            disabled:cursor-not-allowed disabled:opacity-40
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
                            const next = Number(event.target.value);
                            if (Number.isNaN(next)) return;
                            onChange(Math.min(max, Math.max(min, next)));
                        }}
                        className="
                            h-full w-16 border-x border-[var(--app-border)] bg-transparent
                            px-1 text-center text-sm font-medium text-[var(--app-text)]
                            outline-none [appearance:textfield]
                            [&::-webkit-inner-spin-button]:appearance-none
                            [&::-webkit-outer-spin-button]:appearance-none
                        "
                    />
                    <button
                        type="button"
                        onClick={increase}
                        disabled={value >= max}
                        className="
                            flex h-full w-9 items-center justify-center rounded-r-lg
                            text-[var(--app-text-muted)] transition
                            hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]
                            disabled:cursor-not-allowed disabled:opacity-40
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
