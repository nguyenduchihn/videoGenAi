import { Link2 } from "lucide-react";
import { codeSamples, resolvePath } from "../content/codeSamples";
import type { Block, DocSection } from "../content/types";
import { ModelsLive } from "../live/ModelsLive";
import { PlanLimitsLive } from "../live/PlanLimitsLive";
import { YourKeyLive } from "../live/YourKeyLive";
import { Callout } from "./Callout";
import { CodeTabs } from "./CodeTabs";
import { CopyField } from "./CopyField";
import { DataTable, ParamTable } from "./DataTable";
import { EndpointRow } from "./EndpointRow";
import { Inline } from "./Inline";
import { LifecycleDiagram } from "./LifecycleDiagram";
import { WorkerCards } from "./WorkerCards";

const LANG_LABEL = { bash: "Shell", js: "JavaScript", python: "Python", json: "JSON" } as const;

function BlockView({ block }: { block: Block }) {
    switch (block.kind) {
        case "p":
            return <p className="text-[15px] leading-7 text-app-text-secondary"><Inline text={block.text} /></p>;
        case "h3":
            return <h3 className="pt-2 text-base font-semibold text-app-text">{block.text}</h3>;
        case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
                <Tag className="space-y-2.5">
                    {block.items.map((it, i) => (
                        <li key={i} className="flex gap-3 text-[15px] leading-7 text-app-text-secondary">
                            {block.ordered ? (
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-accent-soft font-mono text-xs font-bold text-app-accent" aria-hidden>{i + 1}</span>
                            ) : (
                                <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-app-text-muted" aria-hidden />
                            )}
                            <span className="min-w-0"><Inline text={it} /></span>
                        </li>
                    ))}
                </Tag>
            );
        }
        case "callout":
            return <Callout tone={block.tone} text={block.text} />;
        case "endpoint":
            return <EndpointRow method={block.method} path={block.path} summary={block.summary} />;
        case "request": {
            const s = codeSamples(block.example);
            return <CodeTabs title={block.title ?? `${block.example.method} ${resolvePath(block.example)}`} tabs={[{ label: "cURL", lang: "bash", code: s.curl }, { label: "Python", lang: "python", code: s.python }, { label: "Node.js", lang: "js", code: s.node }]} />;
        }
        case "code":
            return <CodeTabs title={block.title} tabs={[{ label: block.title ?? LANG_LABEL[block.lang], lang: block.lang, code: block.code }]} />;
        case "samples":
            return <CodeTabs title={block.title} tabs={block.tabs} />;
        case "table":
            return <DataTable head={block.head} rows={block.rows} />;
        case "params":
            return <ParamTable params={block.params} />;
        case "copy":
            return <CopyField label={block.label} value={block.value} />;
        case "workers":
            return <WorkerCards />;
        case "lifecycle":
            return <LifecycleDiagram />;
        case "live":
            if (block.widget === "models") return <ModelsLive fallback={block.fallback} />;
            if (block.widget === "planLimits") return <PlanLimitsLive fallback={block.fallback} />;
            return <YourKeyLive fallback={block.fallback} />;
    }
}

/** Một mục tài liệu: số thứ tự + tiêu đề (có neo sao chép link) + câu dẫn + các khối. */
export function DocSectionView({ section, index }: { section: DocSection; index: number }) {
    const headingId = `${section.id}-heading`;
    return (
        <section id={section.id} data-doc-section aria-labelledby={headingId} className="border-t border-app-border pt-10 first:border-t-0 first:pt-0">
            <p className="font-mono text-xs font-semibold tabular-nums text-app-accent" aria-hidden>{String(index + 1).padStart(2, "0")}</p>
            <h2 id={headingId} tabIndex={-1} className="docs-display group mt-1 flex items-center gap-2 text-2xl font-bold text-app-text focus:outline-none sm:text-[1.75rem]">
                {section.title}
                <a href={`#${section.id}`} aria-label={`Liên kết tới mục ${section.title}`} className="rounded p-1 text-app-text-secondary opacity-0 transition hover:text-app-accent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent group-hover:opacity-100">
                    <Link2 className="h-4 w-4" aria-hidden />
                </a>
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-app-text-secondary"><Inline text={section.lead} /></p>
            <div className="mt-6 space-y-5">
                {section.blocks.map((b, i) => <BlockView key={i} block={b} />)}
            </div>
        </section>
    );
}
