import { ArrowRight } from "lucide-react";

const END_STATES = [
    { label: "succeeded", hint: "có result.url", cls: "docs-method docs-method-success border-app-success/30" },
    { label: "failed", hint: "error + hoàn credit", cls: "docs-method docs-method-danger border-app-danger/30" },
    { label: "cancelled", hint: "hoàn credit", cls: "border-app-border bg-app-surface-soft text-app-text-secondary" },
];

function State({ label, hint, cls }: { label: string; hint: string; cls: string }) {
    return (
        <li className={`flex flex-col rounded-lg border px-3 py-2 ${cls}`}>
            <code className="font-mono text-[13px] font-semibold">{label}</code>
            <span className="text-xs text-app-text">{hint}</span>
        </li>
    );
}

/** Vòng đời task: ngang trên màn rộng, dọc trên mobile. */
export function LifecycleDiagram() {
    return (
        <figure className="m-0 rounded-xl border border-app-border bg-app-surface p-4">
            <figcaption className="sr-only">Vòng đời task: pending, processing, rồi succeeded, failed hoặc cancelled</figcaption>
            <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <State label="pending" hint="đang chờ lượt" cls="border-app-border bg-app-surface-soft text-app-text" />
                <li aria-hidden className="flex justify-center"><ArrowRight className="h-4 w-4 rotate-90 text-app-text-secondary sm:rotate-0" /></li>
                <State label="processing" hint="stage: generate | upscale" cls="docs-method docs-method-accent border-app-accent/30" />
                <li aria-hidden className="flex justify-center"><ArrowRight className="h-4 w-4 rotate-90 text-app-text-secondary sm:rotate-0" /></li>
                <li className="sm:flex-1">
                    <ul className="flex flex-col gap-2 sm:flex-row">
                        {END_STATES.map((s) => <State key={s.label} {...s} />)}
                    </ul>
                </li>
            </ol>
        </figure>
    );
}
