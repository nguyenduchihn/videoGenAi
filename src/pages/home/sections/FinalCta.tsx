import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import { useReveal } from "../useReveal";
import { API_DOCS_URL, trialCtaLabel } from "../landingCopy";

export function FinalCta() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { data } = usePricing();
    const [boxRef, boxClass] = useReveal<HTMLDivElement>();
    const subscription = data?.commercialMode === "subscription";
    const grant = data?.signupGrant;

    return (
        <section aria-labelledby="cta-heading" className="dark-panel hero-noise relative isolate overflow-hidden">
            <div aria-hidden="true" className="hero-blob left-1/2 top-[-260px] h-[520px] w-[760px] -translate-x-1/2" style={{ background: "color-mix(in oklch, var(--app-accent) 20%, transparent)" }} />
            <div ref={boxRef} className={`${boxClass} relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-24 lg:px-8 lg:py-28`}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-app-accent">
                    <Sparkles className="h-6 w-6" aria-hidden />
                </span>
                <h2 id="cta-heading" className="display-lg mt-6 text-white">Bắt đầu tạo video ngay hôm nay.</h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                    {grant ? `Tặng ${grant.toLocaleString("vi-VN")} credit khi đăng ký, không cần thẻ tín dụng. ` : "Không cần thẻ tín dụng. "}
                    {subscription ? "Chọn gói theo kỳ, kích hoạt tự động sau chuyển khoản." : "Nạp thêm bất cứ lúc nào bằng chuyển khoản ngân hàng nội địa."}
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {user ? (
                        <>
                            <button type="button" onClick={() => navigate("/dashboard")} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-app-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-app-accent/25 transition-all hover:-translate-y-0.5 hover:bg-app-accent-hover">
                                Vào Dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </button>
                            <button type="button" onClick={() => navigate(subscription ? "/my-plan" : "/billing")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]">
                                {subscription ? "Gói của tôi" : "Nạp credit"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={() => navigate("/register")} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-app-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-app-accent/25 transition-all hover:-translate-y-0.5 hover:bg-app-accent-hover">
                                {trialCtaLabel(grant)} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </button>
                            <Link to={API_DOCS_URL} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]">
                                <Code2 className="h-4 w-4" aria-hidden /> Thử API
                            </Link>
                        </>
                    )}
                </div>
                <p className="mt-6 text-xs text-white/40">Google Veo 3.1 · VietQR · Webhook · OpenAPI</p>
            </div>
        </section>
    );
}
