import type { KeyboardEvent } from "react";

export interface ChipOption<T extends string | number> {
    value: T;
    label: string;
}

interface ChipGroupProps<T extends string | number> {
    label: string;
    options: ChipOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

/** Nhóm nút chọn một (radiogroup) gọn cho thanh công cụ: mũi tên trái/phải đổi lựa chọn. */
export function ChipGroup<T extends string | number>({
    label,
    options,
    value,
    onChange,
}: ChipGroupProps<T>) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (options.length === 0) return;

        const index = options.findIndex((option) => option.value === value);
        const step =
            event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowUp"
                    ? -1
                    : 0;

        if (step === 0 || index < 0) return;

        event.preventDefault();

        const next = options[(index + step + options.length) % options.length];
        if (next) onChange(next.value);
    };

    return (
        <div className="w-full min-w-0">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[var(--app-text-secondary)]">
                {label}
            </span>

            <div
                role="radiogroup"
                aria-label={label}
                onKeyDown={handleKeyDown}
                className="flex h-10 w-full min-w-0 items-center gap-1 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1"
            >
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onChange(option.value)}
                            className={`h-full shrink-0 whitespace-nowrap rounded-lg px-2 text-xs font-medium transition ${selected
                                    ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                    : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                                }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}