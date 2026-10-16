import { LayoutGrid, Rows3 } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import type { RunCounts } from "@/types/api";
import { nextTabIndex } from "./rovingTabs";
import type { RunTab, RunViewMode } from "./runTabs";

interface RunStatusTabsProps {
    counts: RunCounts;
    total: number;
    value: RunTab;
    onChange: (tab: RunTab) => void;
    viewMode: RunViewMode;
    onViewModeChange: (mode: RunViewMode) => void;
}

export default function RunStatusTabs({ counts, total, value, onChange, viewMode, onViewModeChange }: RunStatusTabsProps) {
    const tabs: Array<{ value: RunTab; label: string; count: number }> = [
        { value: "all", label: "Tất cả", count: total },
        { value: "active", label: "Đang chờ / tạo", count: counts.pending + counts.processing },
        { value: "succeeded", label: "Hoàn thành", count: counts.succeeded },
        { value: "failed", label: "Thất bại", count: counts.failed },
        ...(counts.cancelled > 0 ? [{ value: "cancelled" as const, label: "Đã huỷ", count: counts.cancelled }] : []),
    ];
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const next = nextTabIndex(event.key, index, tabs.length);
        if (next === null) return;
        event.preventDefault();
        onChange(tabs[next]!.value);
        tabRefs.current[next]?.focus();
    };
    return (
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div role="tablist" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
                {tabs.map((tab, index) => {
                    const active = tab.value === value;
                    return (
                        <button
                            key={tab.value}
                            id={`run-tab-${tab.value}`}
                            ref={(el) => { tabRefs.current[index] = el; }}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            tabIndex={active ? 0 : -1}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                            onClick={() => onChange(tab.value)}
                            className={`h-8 rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface)] ${
                                active ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white" : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                            }`}
                        >
                            {tab.label} <span className={active ? "opacity-90" : "text-[var(--app-text-muted)]"}>({tab.count.toLocaleString("vi-VN")})</span>
                        </button>
                    );
                })}
            </div>
            <div role="radiogroup" aria-label="Kiểu hiển thị" className="flex h-8 items-center gap-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-0.5">
                {([["cards", LayoutGrid, "Lưới"], ["rows", Rows3, "Hàng"]] as const).map(([mode, Icon, label]) => (
                    <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={viewMode === mode}
                        aria-label={label}
                        onClick={() => onViewModeChange(mode)}
                        className={`flex h-7 w-8 items-center justify-center rounded-md transition ${viewMode === mode ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]" : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"}`}
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                ))}
            </div>
        </div>
    );
}
