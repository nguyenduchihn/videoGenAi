import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { useCommercialMode } from "@/hooks/useCommercialMode";
import { usePricing } from "@/hooks/usePricing";
import { useReveal } from "../useReveal";
import { buildFaq } from "./faq";

export function FaqSection() {
    const { data } = usePricing();
    const mode = useCommercialMode();
    const items = buildFaq({ signupGrant: data?.signupGrant, maxBatchTasks: data?.maxBatchTasks, subscription: mode === "subscription" });
    const [open, setOpen] = useState<number | null>(0);
    const baseId = useId();
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    const [listRef, listClass] = useReveal<HTMLDivElement>();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
    };

    return (
        <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 border-t border-app-border bg-app-surface">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
                <div ref={headRef} className={headClass}>
                    <p className="eyebrow text-app-accent">Câu hỏi thường gặp</p>
                    <h2 id="faq-heading" className="display-lg mt-4 text-app-text">
                        Điều bạn muốn biết <span className="text-app-accent">trước khi bắt đầu.</span>
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-app-text-secondary">Chưa thấy câu trả lời? Trang Hỗ trợ trong ứng dụng luôn mở.</p>
                </div>
                <div ref={listRef} className={`${listClass} divide-y divide-app-border rounded-2xl border border-app-border bg-app-bg`}>
                    {items.map((it, i) => {
                        const expanded = open === i;
                        const btnId = `${baseId}-q-${i}`;
                        const panelId = `${baseId}-a-${i}`;
                        return (
                            <div key={it.q}>
                                <h3>
                                    <button
                                        type="button"
                                        id={btnId}
                                        aria-expanded={expanded}
                                        aria-controls={panelId}
                                        onClick={() => setOpen(expanded ? null : i)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-app-text transition hover:text-app-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 sm:text-base"
                                    >
                                        {it.q}
                                        <Plus className={`h-4 w-4 shrink-0 text-app-text-muted transition-transform duration-300 ${expanded ? "rotate-45 text-app-accent" : ""}`} aria-hidden />
                                    </button>
                                </h3>
                                <div id={panelId} role="region" aria-labelledby={btnId} className="faq-body" data-open={expanded}>
                                    <div>
                                        <p className="px-5 pb-5 text-sm leading-7 text-app-text-secondary">{it.a}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
