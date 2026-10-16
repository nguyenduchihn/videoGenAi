import { CopyButton } from "@/components/ui";

export function CopyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-app-border bg-app-surface px-3 py-2 sm:px-4">
            <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-app-text-secondary sm:w-20">{label}</span>
            <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-app-text" title={value}>{value}</code>
            <CopyButton value={value} label={`Sao chép ${label}`} className="shrink-0 [&>span]:sr-only" />
        </div>
    );
}
