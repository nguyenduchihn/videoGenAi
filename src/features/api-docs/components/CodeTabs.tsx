import { useId, useRef, type KeyboardEvent } from "react";
import { nextTabIndex } from "@/components/runs/rovingTabs";
import { CopyButton } from "@/components/ui";
import type { CodeLang } from "../content/types";
import { setPreferredLang, usePreferredLang } from "../hooks/usePreferredLang";
import { CodeBlock } from "./CodeBlock";

export interface CodeTab {
    label: string;
    lang: CodeLang;
    code: string;
}

interface CodeTabsProps {
    tabs: CodeTab[];
    title?: string;
}

/** Khung code nhiều ngôn ngữ: tablist WAI-ARIA (mũi tên/Home/End), nhớ lựa chọn cho cả trang, nút sao chép. */
export function CodeTabs({ tabs, title }: CodeTabsProps) {
    const baseId = useId();
    const preferred = usePreferredLang();
    const refs = useRef<Array<HTMLButtonElement | null>>([]);
    const activeIndex = Math.max(0, tabs.findIndex((t) => t.label === preferred));
    const active = tabs[activeIndex]!;
    const single = tabs.length === 1;

    const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
        const next = nextTabIndex(e.key, i, tabs.length);
        if (next === null) return;
        e.preventDefault();
        setPreferredLang(tabs[next]!.label);
        refs.current[next]?.focus();
    };

    return (
        <figure className="m-0 overflow-hidden rounded-xl border border-[var(--docs-term-border)] shadow-lg shadow-black/10">
            {/* cỡ chữ đặt ở khung: index.css có `button { font: inherit }` ngoài layer ⇒ text-xs trên <button> không ăn */}
            <div className="flex min-h-11 items-center justify-between gap-2 border-b border-white/[0.07] bg-[var(--docs-term-bar)] px-2 py-1.5 text-xs sm:px-3">
                {single ? (
                    <figcaption className="px-1 text-xs font-medium text-white/60">{title ?? active.label}</figcaption>
                ) : (
                    <div className="flex min-w-0 items-center gap-3">
                        {title && <figcaption className="hidden truncate text-xs font-medium text-white/50 md:block">{title}</figcaption>}
                        <div role="tablist" aria-label={title ? `Ngôn ngữ: ${title}` : "Ngôn ngữ"} className="flex shrink-0 gap-0.5 rounded-lg bg-white/[0.06] p-0.5">
                            {tabs.map((t, i) => {
                                const selected = i === activeIndex;
                                return (
                                    <button
                                        key={t.label}
                                        ref={(el) => { refs.current[i] = el; }}
                                        type="button"
                                        role="tab"
                                        id={`${baseId}-tab-${i}`}
                                        aria-selected={selected}
                                        aria-controls={`${baseId}-panel`}
                                        tabIndex={selected ? 0 : -1}
                                        onClick={() => setPreferredLang(t.label)}
                                        onKeyDown={(e) => onKey(e, i)}
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/60 ${selected ? "bg-white/[0.14] text-white" : "text-white/55 hover:text-white/85"}`}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <CopyButton value={active.code} label="Sao chép" className="shrink-0 text-white/60 hover:bg-white/10 hover:text-white" />
            </div>
            <div id={`${baseId}-panel`} {...(single ? {} : { role: "tabpanel", "aria-labelledby": `${baseId}-tab-${activeIndex}` })}>
                <CodeBlock code={active.code} lang={active.lang} label={`${title ?? "Ví dụ"} (${active.label})`} />
            </div>
        </figure>
    );
}
