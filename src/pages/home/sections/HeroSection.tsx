import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { nextTabIndex } from "@/components/runs/rovingTabs";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import { useIsDark } from "../useIsDark";
import { API_DOCS_URL, trialCtaLabel } from "../landingCopy";

type HeroTab = "studio" | "api";
const TABS: { id: HeroTab; label: string }[] = [
    { id: "studio", label: "Studio" },
    { id: "api", label: "API" },
];

/** Ảnh chụp thật của Studio (mock dữ liệu), 1280×800, AVIF + WebP; chỉ tải biến thể đúng theme. */
function StudioShot({ dark }: { dark: boolean }) {
    const name = dark ? "studio-dark" : "studio-light";
    return (
        <picture key={name}>
            <source srcSet={`/landing/${name}.avif`} type="image/avif" />
            <img
                src={`/landing/${name}.webp`}
                alt="Giao diện Studio VideoGen AI: chọn chế độ Văn bản → Video, nhập prompt, theo dõi lượt tạo"
                width={1280}
                height={800}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="block h-auto w-full"
            />
        </picture>
    );
}

/** Code mẫu tĩnh: đúng hình dạng POST /v1/tasks + phản hồi thật; tô màu bằng span, không thư viện. */
function ApiPreview() {
    return (
        <pre className="terminal m-0 overflow-x-auto rounded-b-2xl p-5 text-left" tabIndex={0} aria-label="Ví dụ gọi API tạo video">
            <code>
                <span className="tok-cmt"># Tạo 1 video từ văn bản (lô tối đa 20 task)</span>{"\n"}
                <span className="tok-kw">curl</span> -X POST https://api.aiveo3.org/v1/tasks \{"\n"}
                {"  "}-H <span className="tok-str">"X-API-Key: vk_your_key"</span> \{"\n"}
                {"  "}-H <span className="tok-str">"Idempotency-Key: 7f1c2c9e-..."</span> \{"\n"}
                {"  "}-H <span className="tok-str">"Content-Type: application/json"</span> \{"\n"}
                {"  "}-d <span className="tok-str">{"'{"}</span>{"\n"}
                {"    "}<span className="tok-key">"tasks"</span>: [{"{"} <span className="tok-key">"worker"</span>: <span className="tok-str">"text-to-video"</span>,{"\n"}
                {"      "}<span className="tok-key">"params"</span>: {"{"} <span className="tok-key">"prompt"</span>: <span className="tok-str">"Hoàng hôn trên vịnh Hạ Long"</span>, <span className="tok-key">"model"</span>: <span className="tok-str">"Veo_3.1-Lite"</span> {"}"} {"}"}],{"\n"}
                {"    "}<span className="tok-key">"webhookUrl"</span>: <span className="tok-str">"https://your-app.com/hooks/veo"</span>{"\n"}
                {"  "}<span className="tok-str">{"}'"}</span>{"\n"}
                {"\n"}
                <span className="tok-cmt"># 202 Accepted</span>{"\n"}
                {"{"} <span className="tok-key">"batchId"</span>: <span className="tok-str">"b_01HZX…"</span>, <span className="tok-key">"totalCredits"</span>: <span className="tok-num">5</span>,{"\n"}
                {"  "}<span className="tok-key">"tasks"</span>: [{"{"} <span className="tok-key">"id"</span>: <span className="tok-str">"t_01HZX…"</span>, <span className="tok-key">"status"</span>: <span className="tok-str">"pending"</span> {"}"}] {"}"}<span className="cursor" />
            </code>
        </pre>
    );
}

export function HeroSection() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { data } = usePricing();
    const isDark = useIsDark();
    const [tab, setTab] = useState<HeroTab>("studio");
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const signupGrant = data?.signupGrant;
    const batchMax = data?.maxBatchTasks;

    const onTabKey = (e: React.KeyboardEvent, index: number) => {
        const next = nextTabIndex(e.key, index, TABS.length);
        if (next === null) return;
        e.preventDefault();
        setTab(TABS[next]!.id);
        tabRefs.current[next]?.focus();
    };

    return (
        <section className="dark-panel hero-noise relative isolate overflow-hidden" aria-labelledby="hero-heading">
            <div aria-hidden="true" className="hero-blob -left-32 -top-40 h-[520px] w-[620px]" style={{ background: "color-mix(in oklch, var(--app-accent) 22%, transparent)" }} />
            <div aria-hidden="true" className="hero-blob -bottom-48 right-[-10%] h-[460px] w-[560px]" style={{ background: "color-mix(in oklch, var(--app-gradient-start) 12%, transparent)" }} />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-28 pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:px-8 lg:pb-36 lg:pt-24">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/80">
                        <Sparkles className="h-3.5 w-3.5 text-app-accent" aria-hidden />
                        Chạy trên Google Veo 3.1
                    </p>
                    <h1 id="hero-heading" className="display-xl mt-6 text-white">
                        Tạo video chuyên nghiệp
                        <br />
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(100deg, var(--app-accent) 0%, var(--app-gradient-end) 60%, var(--app-gradient-start) 120%)" }}>
                            bằng API hoặc Studio.
                        </span>
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
                        Gọi một REST API hoặc dùng Studio trực quan: nhập prompt hay ảnh, chạy hàng loạt, nhận video và ảnh Veo 3.1 trong vài phút.
                        {signupGrant ? <> Đăng ký nhận ngay <strong className="num font-semibold text-white">{signupGrant.toLocaleString("vi-VN")} credit</strong> dùng thử.</> : null}
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        {user ? (
                            <button type="button" onClick={() => navigate("/dashboard")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-app-accent px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-app-accent/25 transition-all hover:-translate-y-0.5 hover:bg-app-accent-hover">
                                Vào Dashboard
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </button>
                        ) : (
                            <button type="button" onClick={() => navigate("/register")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-app-accent px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-app-accent/25 transition-all hover:-translate-y-0.5 hover:bg-app-accent-hover">
                                {trialCtaLabel(signupGrant)}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </button>
                        )}
                        <Link to={API_DOCS_URL} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-medium text-white/85 transition-all hover:border-white/25 hover:bg-white/[0.08]">
                            <BookOpen className="h-4 w-4" aria-hidden />
                            Xem tài liệu API
                        </Link>
                    </div>
                    <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55" aria-label="Cam kết">
                        {["Không cần thẻ tín dụng", "Thanh toán chuyển khoản, cộng credit tự động", "Task lỗi được hoàn credit"].map((t) => (
                            <li key={t} className="inline-flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-app-accent" aria-hidden />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative">
                    <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-[32px] blur-3xl" style={{ background: "color-mix(in oklch, var(--app-accent) 14%, transparent)" }} />
                    <div className="hero-card relative overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
                        <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-3">
                            <div className="flex items-center gap-1.5 pl-1" aria-hidden="true">
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                            </div>
                            <div role="tablist" aria-label="Xem trước sản phẩm" className="flex items-center gap-0.5 rounded-lg bg-white/[0.06] p-0.5">
                                {TABS.map((t, i) => (
                                    <button
                                        key={t.id}
                                        ref={(el) => { tabRefs.current[i] = el; }}
                                        type="button"
                                        role="tab"
                                        id={`hero-tab-${t.id}`}
                                        aria-selected={tab === t.id}
                                        aria-controls={`hero-panel-${t.id}`}
                                        tabIndex={tab === t.id ? 0 : -1}
                                        onClick={() => setTab(t.id)}
                                        onKeyDown={(e) => onTabKey(e, i)}
                                        className={`rounded-md px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/60 ${tab === t.id ? "bg-white/[0.12] text-white" : "text-white/55 hover:text-white/85"}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <span className="hidden text-[11px] text-white/35 sm:block">aiveo3.org</span>
                        </div>
                        <div role="tabpanel" id={`hero-panel-${tab}`} aria-labelledby={`hero-tab-${tab}`} className="min-h-[260px] bg-black/20">
                            {tab === "studio" ? <StudioShot dark={isDark} /> : <ApiPreview />}
                        </div>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-white/40">
                        {tab === "studio" ? "Giao diện Studio thật: chọn chế độ, nhập prompt, theo dõi lượt tạo." : `Một request tạo tới ${batchMax ?? "nhiều"} task; theo dõi qua GET /v1/batches/:id hoặc webhook.`}
                    </p>
                </div>
            </div>
            <div className="hero-fade" aria-hidden="true" />
        </section>
    );
}
