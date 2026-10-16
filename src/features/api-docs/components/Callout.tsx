import { Info, TriangleAlert } from "lucide-react";
import type { Inline as InlineText } from "../content/types";
import { Inline } from "./Inline";

export function Callout({ tone, text }: { tone: "info" | "warn"; text: InlineText }) {
    const Icon = tone === "warn" ? TriangleAlert : Info;
    const color = tone === "warn" ? "border-app-warning/30 bg-app-warning-soft text-app-warning" : "border-app-info/25 bg-app-info-soft text-app-info";
    return (
        <div role="note" className={`flex gap-3 rounded-xl border px-4 py-3 ${color}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="text-sm leading-6 text-app-text"><Inline text={text} /></p>
        </div>
    );
}
