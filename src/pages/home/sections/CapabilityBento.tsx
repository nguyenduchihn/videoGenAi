import { ArrowUpRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getWorkerInfo, WORKER_ORDER } from "@/features/pricing/workerInfo";
import { usePricing } from "@/hooks/usePricing";
import type { PricingWorker } from "@/types/api";
import { useReveal } from "../useReveal";
import { API_DOCS_URL, creditBadge } from "../landingCopy";

const FEATURED = "text-to-video";

function Card({ workerKey, worker, featured = false }: { workerKey: string; worker: PricingWorker | undefined; featured?: boolean }) {
    const info = getWorkerInfo(workerKey);
    const Icon = info.icon;
    const badge = creditBadge(worker);
    return (
        <article
            aria-label={info.label}
            className={`lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-app-border p-5 hover:border-app-accent/40 hover:shadow-xl hover:shadow-app-accent/[0.06] ${featured ? "bg-app-accent-soft lg:col-span-2 lg:p-7" : "bg-app-surface"}`}
        >
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-app-accent/[0.06] blur-2xl transition-colors group-hover:bg-app-accent/[0.14]" />
            <div className="relative flex items-start justify-between gap-3">
                <span className={`flex items-center justify-center rounded-xl text-app-accent transition-colors group-hover:bg-app-accent group-hover:text-white ${featured ? "h-12 w-12 bg-app-surface" : "h-10 w-10 bg-app-accent-soft"}`}>
                    <Icon className={featured ? "h-5 w-5" : "h-4.5 w-4.5"} aria-hidden />
                </span>
                {badge && <span className="num rounded-full border border-app-border bg-app-surface px-2.5 py-1 text-[11px] font-semibold text-app-text">{badge}</span>}
            </div>
            <h3 className={`relative mt-5 font-semibold tracking-tight text-app-text ${featured ? "display-md" : "text-base"}`}>{info.label}</h3>
            <p className={`relative mt-2 flex-1 text-app-text-secondary ${featured ? "max-w-md text-sm leading-7 sm:text-base" : "text-sm leading-6"}`}>{info.description}</p>
            <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">{info.kind === "video" ? "Video" : "Ảnh"}</p>
        </article>
    );
}

export function CapabilityBento() {
    const { data } = usePricing();
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    const [gridRef, gridClass] = useReveal<HTMLDivElement>();
    const workers = data?.workers ?? {};
    const rest = WORKER_ORDER.filter((k) => k !== FEATURED);

    return (
        <section id="san-pham" aria-labelledby="product-heading" className="scroll-mt-20 bg-app-bg">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-28">
                <div ref={headRef} className={`${headClass} grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end`}>
                    <div className="max-w-2xl">
                        <p className="eyebrow text-app-accent">Khả năng AI</p>
                        <h2 id="product-heading" className="display-lg mt-4 text-app-text">
                            Mọi cách tạo video và ảnh,
                            <br />
                            <span className="text-app-accent">cùng một API.</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-sm leading-7 text-app-text-secondary sm:text-base">
                        Chín chế độ gen là chín giá trị <code className="rounded bg-app-surface-soft px-1.5 py-0.5 text-xs">worker</code> của API. Giá credit bên cạnh lấy thẳng từ bảng giá hiện hành.
                    </p>
                </div>

                <div ref={gridRef} className={`${gridClass} mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4`}>
                    <Card workerKey={FEATURED} worker={workers[FEATURED]} featured />
                    {rest.map((key) => (
                        <Card key={key} workerKey={key} worker={workers[key]} />
                    ))}
                    <article aria-label="Tích hợp API" className="dark-panel lift relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-5 sm:col-span-2 lg:col-span-2 lg:p-7">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl" style={{ background: "color-mix(in oklch, var(--app-accent) 35%, transparent)" }} />
                        <div className="relative">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                                <Code2 className="h-5 w-5" aria-hidden />
                            </span>
                            <h3 className="display-md mt-5 text-white">Mọi chế độ đều gọi được qua API</h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
                                Một endpoint <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">POST /v1/tasks</code> cho cả chín chế độ{data?.maxBatchTasks ? `, tới ${data.maxBatchTasks} task mỗi request` : ""}. Nhận kết quả qua webhook hoặc poll.
                            </p>
                        </div>
                        <div className="relative mt-6 flex flex-wrap gap-2">
                            <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-[#0b0b12] transition hover:bg-white/90">
                                Tài liệu API <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </a>
                            <Link to="/settings/api-keys" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                                Lấy API key
                            </Link>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
