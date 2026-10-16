import { ArrowUpRight, Bell, Boxes, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { nextTabIndex } from "@/components/runs/rovingTabs";
import { CopyButton } from "@/components/ui";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import { useReveal } from "../useReveal";
import { API_SAMPLES, type ApiSample } from "./apiSamples";
import { highlight } from "./highlight";
import { API_DOCS_URL } from "../landingCopy";

interface Highlight {
    icon: LucideIcon;
    title: string;
    desc: string;
}

function CodeBlock({ sample }: { sample: ApiSample }) {
    return (
        <pre className="terminal m-0 overflow-x-auto rounded-b-2xl p-5" tabIndex={0} role="region" aria-label={`Ví dụ gọi API bằng ${sample.label}`}>
            <code>
                {highlight(sample.code, sample.lang).map((line, i) => (
                    <span key={i} className="block min-h-[1.65em]">
                        {line.map((seg, j) => (seg.kind ? <span key={j} className={`tok-${seg.kind}`}>{seg.text}</span> : <span key={j}>{seg.text}</span>))}
                    </span>
                ))}
            </code>
        </pre>
    );
}

export function ApiSection() {
    const { data } = usePricing();
    const loggedIn = useAuthStore((s) => s.user !== null);
    const [active, setActive] = useState<ApiSample["id"]>("curl");
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [headRef, headClass] = useReveal<HTMLDivElement>();
    const [panelRef, panelClass] = useReveal<HTMLDivElement>();
    const sample = API_SAMPLES.find((s) => s.id === active) ?? API_SAMPLES[0]!;
    const batch = data?.maxBatchTasks;

    const highlights: Highlight[] = [
        { icon: Boxes, title: batch ? `Lô tới ${batch} task mỗi request` : "Gửi hàng loạt trong một request", desc: "Trộn video và ảnh trong cùng một lô; cả lô được tạo hoặc bị từ chối cùng nhau." },
        { icon: ShieldCheck, title: "Idempotency-Key", desc: "Gửi lại cùng key và body khi mạng lỗi ⇒ nhận lại đúng phản hồi cũ, không bị trừ credit hai lần." },
        { icon: Bell, title: "Webhook hoặc poll", desc: "Đặt webhookUrl cho lô để được gọi khi xong; hoặc GET /v1/batches/:id khi bạn muốn tự kiểm tra." },
        { icon: RotateCcw, title: "Lỗi rõ ràng, hoàn credit", desc: "Mọi lỗi cùng dạng { error: { code, message, requestId } }; task thất bại được hoàn credit tự động." },
    ];

    const onTabKey = (e: React.KeyboardEvent, index: number) => {
        const next = nextTabIndex(e.key, index, API_SAMPLES.length);
        if (next === null) return;
        e.preventDefault();
        setActive(API_SAMPLES[next]!.id);
        tabRefs.current[next]?.focus();
    };

    return (
        <section id="api" aria-labelledby="api-heading" className="scroll-mt-20 border-t border-app-border bg-app-bg">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14 lg:px-8 lg:py-28">
                <div ref={headRef} className={headClass}>
                    <p className="eyebrow text-app-accent">API · REST · OpenAPI</p>
                    <h2 id="api-heading" className="display-lg mt-4 text-app-text">
                        Tích hợp trong vài phút, <span className="text-app-accent">không cần hạ tầng AI.</span>
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-app-text-secondary sm:text-base">
                        REST API xác thực bằng header <code className="rounded bg-app-surface-soft px-1.5 py-0.5 text-xs">X-API-Key</code>, có Swagger và OpenAPI để import Postman hay sinh client. Cùng hàng đợi và bảng giá với Studio.
                    </p>
                    <ul className="mt-8 space-y-4">
                        {highlights.map(({ icon: Icon, title, desc }) => (
                            <li key={title} className="flex gap-3.5">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-accent-soft text-app-accent">
                                    <Icon className="h-4 w-4" aria-hidden />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-app-text">{title}</p>
                                    <p className="mt-0.5 text-sm leading-6 text-app-text-secondary">{desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-app-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-app-accent/20 transition hover:bg-app-accent-hover">
                            Xem tài liệu API <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </a>
                        <Link to={loggedIn ? "/settings/api-keys" : "/register"} className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-5 py-3 text-sm font-semibold text-app-text transition hover:border-app-accent/40 hover:text-app-accent">
                            <KeyRound className="h-4 w-4" aria-hidden />
                            {loggedIn ? "Quản lý API key" : "Lấy API key"}
                        </Link>
                    </div>
                </div>

                <div ref={panelRef} className={`${panelClass} overflow-hidden rounded-2xl border border-app-border shadow-2xl shadow-black/20`}>
                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0d0e17] px-3 py-2">
                        <div role="tablist" aria-label="Ngôn ngữ ví dụ" className="flex items-center gap-0.5 rounded-lg bg-white/[0.06] p-0.5">
                            {API_SAMPLES.map((s, i) => (
                                <button
                                    key={s.id}
                                    ref={(el) => { tabRefs.current[i] = el; }}
                                    type="button"
                                    role="tab"
                                    id={`api-tab-${s.id}`}
                                    aria-selected={active === s.id}
                                    aria-controls="api-code-panel"
                                    tabIndex={active === s.id ? 0 : -1}
                                    onClick={() => setActive(s.id)}
                                    onKeyDown={(e) => onTabKey(e, i)}
                                    className={`rounded-md px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/60 ${active === s.id ? "bg-white/[0.12] text-white" : "text-white/55 hover:text-white/85"}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <CopyButton value={sample.code} label="Sao chép" className="text-white/60 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div id="api-code-panel" role="tabpanel" aria-labelledby={`api-tab-${sample.id}`}>
                        <CodeBlock sample={sample} />
                    </div>
                </div>
            </div>
        </section>
    );
}
