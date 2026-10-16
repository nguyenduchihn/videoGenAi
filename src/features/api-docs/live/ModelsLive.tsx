import { Skeleton } from "@/components/ui";
import { usePricing } from "@/hooks/usePricing";
import type { PricingWorker } from "@/types/api";
import { Callout } from "../components/Callout";
import { IMAGE_MODEL_IDS, VIDEO_MODEL_IDS } from "../content/workers";

const creditOf = (w: PricingWorker | undefined, model: string): number | null => w?.models[model] ?? w?.credits ?? null;

function PriceList({ title, rows, unit }: { title: string; rows: Array<{ name: string; credits: number | null; tag?: string }>; unit: string }) {
    return (
        <div role="group" className="rounded-xl border border-app-border bg-app-surface p-4" aria-label={title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-text-secondary">{title}</h3>
            <ul className="mt-3 space-y-2">
                {rows.map((r) => (
                    <li key={r.name} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0">
                            <code className="break-all font-mono text-[13px] text-app-text">{r.name}</code>
                            {r.tag && <span className="ml-2 rounded bg-app-accent-soft px-1.5 py-px text-[10px] font-semibold uppercase text-app-accent">{r.tag}</span>}
                        </span>
                        <span className="shrink-0 tabular-nums font-semibold text-app-text">{r.credits ?? "—"}<span className="ml-1 text-xs font-normal text-app-text-secondary">{unit}</span></span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Giá credit sống từ /portal/pricing (công khai) ⇒ không cần đăng nhập, không hard-code giá. */
export function ModelsLive({ fallback }: { fallback: string }) {
    const { data, isLoading, isError } = usePricing();
    if (isLoading) return <div className="grid gap-3 md:grid-cols-3">{/* cao bằng thẻ thật (≈168px mobile, 216px desktop) ⇒ mở link #muc không bị đẩy lệch khi giá tải xong */}{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[10.5rem] rounded-xl md:h-[13.5rem]" />)}</div>;
    if (isError || !data) return <Callout tone="info" text={fallback} />;
    const video = data.workers["text-to-video"];
    const image = data.workers["text-to-image"];
    const upImg = data.workers["upscale-image"];
    const upVid = data.workers["upscale-video"];
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <PriceList title="Video · mỗi job" unit="credit" rows={VIDEO_MODEL_IDS.map((m, i) => ({ name: m, credits: creditOf(video, m), tag: i === 0 ? "mặc định" : undefined }))} />
            <PriceList title="Ảnh · mỗi job" unit="credit" rows={IMAGE_MODEL_IDS.map((m, i) => ({ name: m, credits: creditOf(image, m), tag: i === 0 ? "mặc định" : undefined }))} />
            <PriceList
                title="Upscale · cộng thêm"
                unit="credit"
                rows={[
                    ...Object.entries(upImg?.models ?? {}).map(([r, c]) => ({ name: `Ảnh ${r}`, credits: c })),
                    ...Object.entries(upVid?.models ?? {}).map(([r, c]) => ({ name: `Video ${r}`, credits: c })),
                ]}
            />
        </div>
    );
}
