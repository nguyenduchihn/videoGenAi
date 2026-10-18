import type { MouseEvent } from "react";
import { scrollToSection } from "../hooks/scrollToSection";

export interface TocItem {
    id: string;
    title: string;
}

interface TocProps {
    items: TocItem[];
    active: string | null;
}

/** Mobile: select dính ngay dưới header — đặt làm con trực tiếp của khung trang (sticky cần cha đủ cao). */
export function DocsTocSelect({ items, active }: TocProps) {
    return (
            <div className="sticky top-14 z-20 border-b border-app-border bg-app-bg/95 px-4 py-2 backdrop-blur lg:hidden">
                <label htmlFor="docs-toc-select" className="sr-only">Chuyển tới mục</label>
                <select
                    id="docs-toc-select"
                    value={active ?? items[0]?.id}
                    onChange={(e) => scrollToSection(e.target.value)}
                    className="h-10 w-full rounded-lg border border-app-border bg-app-surface px-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/40"
                >
                    {items.map((it, i) => <option key={it.id} value={it.id}>{`${String(i + 1).padStart(2, "0")} · ${it.title}`}</option>)}
                </select>
            </div>
    );
}

/** Desktop: nav dính bên trái, aria-current theo mục đang đọc. */
export function DocsTocNav({ items, active }: TocProps) {
    const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        scrollToSection(id);
    };
    return (
            <nav aria-label="Mục lục" className="sticky top-[var(--docs-sticky-top)] hidden max-h-[calc(100dvh-6rem)] w-[var(--docs-toc-w)] shrink-0 overflow-y-auto pb-8 lg:block">
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-app-text-secondary">Mục lục</p>
                <ol className="space-y-0.5 border-l border-app-border">
                    {items.map((it, i) => {
                        const current = it.id === active;
                        return (
                            <li key={it.id}>
                                <a
                                    href={`#${it.id}`}
                                    onClick={(e) => onClick(e, it.id)}
                                    aria-current={current ? "location" : undefined}
                                    className={`-ml-px flex gap-2.5 border-l-2 py-1.5 pl-3 pr-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-app-accent ${current ? "border-app-accent font-medium text-app-text" : "border-transparent text-app-text-secondary hover:border-app-text-muted hover:text-app-text"}`}
                                >
                                    <span className={`w-5 shrink-0 font-mono text-[11px] leading-5 tabular-nums ${current ? "text-app-accent" : "text-app-text-secondary"}`}>{String(i + 1).padStart(2, "0")}</span>
                                    {it.title}
                                </a>
                            </li>
                        );
                    })}
                </ol>
            </nav>
    );
}
