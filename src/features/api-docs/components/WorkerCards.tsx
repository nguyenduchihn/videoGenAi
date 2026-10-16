import { ChevronRight, Film, ImageIcon } from "lucide-react";
import { codeSamples } from "../content/codeSamples";
import { WORKERS } from "../content/workers";
import { CodeTabs } from "./CodeTabs";
import { ParamTable } from "./DataTable";
import { Inline } from "./Inline";

/** 7 chế độ tạo: details/summary (mở bằng bàn phím sẵn, không JS), mỗi thẻ có bảng tham số + ví dụ 3 ngôn ngữ. */
export function WorkerCards() {
    return (
        <div className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border bg-app-surface">
            {WORKERS.map((w) => {
                const Icon = w.kind === "video" ? Film : ImageIcon;
                const s = codeSamples(w.example);
                return (
                    <details key={w.id} id={`worker-${w.id}`} className="group">
                        <summary className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition hover:bg-app-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-app-accent">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${w.kind === "video" ? "bg-app-accent-soft text-app-accent" : "bg-app-info-soft text-app-info"}`}>
                                <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-app-text">{w.title}</span>
                                <code className="block truncate font-mono text-xs text-app-text-secondary">{w.id}</code>
                            </span>
                            <span className="hidden text-right text-xs text-app-text-secondary md:block md:max-w-[18rem]"><Inline text={w.summary} /></span>
                            <ChevronRight className="docs-chevron h-4 w-4 shrink-0 text-app-text-secondary" aria-hidden />
                        </summary>
                        <div className="space-y-4 border-t border-app-border bg-app-bg/40 px-4 py-4">
                            <p className="text-sm leading-6 text-app-text-secondary md:hidden"><Inline text={w.summary} /></p>
                            {w.imageRoles.length > 0 && (
                                <ul className="space-y-1 text-sm leading-6 text-app-text-secondary">
                                    {w.imageRoles.map((r) => <li key={r} className="flex gap-2"><span aria-hidden className="text-app-text-secondary">•</span><span><Inline text={r} /></span></li>)}
                                </ul>
                            )}
                            <ParamTable params={w.params} />
                            <CodeTabs title={`Ví dụ ${w.id}`} tabs={[{ label: "cURL", lang: "bash", code: s.curl }, { label: "Python", lang: "python", code: s.python }, { label: "Node.js", lang: "js", code: s.node }]} />
                        </div>
                    </details>
                );
            })}
        </div>
    );
}
