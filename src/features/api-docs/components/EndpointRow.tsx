import type { HttpMethod, Inline as InlineText } from "../content/types";
import { Inline } from "./Inline";
import { MethodBadge } from "./MethodBadge";

export function EndpointRow({ method, path, summary }: { method: HttpMethod; path: string; summary: InlineText }) {
    return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-app-border bg-app-surface px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="flex min-w-0 items-center gap-3">
                <MethodBadge method={method} />
                <code className="min-w-0 break-all font-mono text-[13px] font-semibold text-app-text">{path}</code>
            </span>
            <span className="text-sm leading-6 text-app-text-secondary sm:ml-auto sm:text-right"><Inline text={summary} /></span>
        </div>
    );
}
