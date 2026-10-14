import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { portalApi } from "@/api/portal.api";
import { Button, Field, Input, PasswordInput } from "@/components/ui";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
type FV = z.infer<typeof schema>;

const HERO_ITEMS = ["Tạo video từ ý tưởng đơn giản", "AI hỗ trợ nội dung và âm thanh", "Quản lý dự án tại một nơi"];

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const refreshMe = useAuthStore((s) => s.refreshMe);
    const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: FV) => {
        clearErrors("root");
        try {
            await portalApi.auth.login({ email: data.email, password: data.password });
            await refreshMe();
            navigate((location.state as { from?: string })?.from ?? "/dashboard", { replace: true });
        } catch (err) {
            const code = err instanceof ApiError ? err.code : null;
            if (code === "EMAIL_NOT_VERIFIED") { navigate(`/verify-email?email=${encodeURIComponent(data.email)}`); return; }
            setError("root", { message: code === "USER_SUSPENDED" ? "Tài khoản đã bị khoá." : code === "INVALID_CREDENTIALS" ? "Email hoặc mật khẩu không đúng." : (err instanceof ApiError && err.status === 429) ? "Quá nhiều lần thử. Vui lòng đợi." : getErrorMessage(err) });
        }
    };

    return (
        <div className="flex min-h-screen">
            <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0b0d14] p-10 lg:flex lg:w-[48%] xl:p-14">
                <div className="absolute -left-44 -top-44 h-[500px] w-[500px] rounded-full bg-[var(--app-accent)]/20 blur-[110px]" />
                <Link to="/" className="relative z-10 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white"><Sparkles className="h-4 w-4 text-gray-900" /></div>
                    <span className="text-[17px] font-semibold text-white">VideoGen AI</span>
                </Link>
                <div className="relative z-10">
                    <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.04em] text-white xl:text-5xl">Biến ý tưởng thành video<span className="mt-1 block bg-gradient-to-r from-[var(--app-accent)] to-amber-300 bg-clip-text text-transparent">chuyên nghiệp.</span></h1>
                    <div className="mt-6 space-y-3">
                        {HERO_ITEMS.map((t) => (
                            <div key={t} className="flex items-center gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10"><Check className="h-3 w-3 text-[var(--app-accent)]" /></span>
                                <span className="text-sm text-white/80">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative z-10 text-xs text-white/40">© 2026 VideoGen AI</p>
            </section>
            <section className="flex flex-1 items-center justify-center px-5 py-10">
                <div className="w-full max-w-[390px]">
                    <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent)]"><Sparkles className="h-4 w-4 text-white" /></div>
                        <span className="text-[17px] font-semibold text-[var(--app-text)]">VideoGen AI</span>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Đăng nhập</h2>
                    <p className="mt-2 text-sm text-[var(--app-text-secondary)]">Tiếp tục quản lý và tạo video.</p>
                    {params.get("reason") === "expired" && <div className="mt-4 rounded-xl border border-app-info/30 bg-app-info-soft px-4 py-3 text-sm text-app-info">Phiên đã hết hạn. Vui lòng đăng nhập lại.</div>}
                    {params.get("error") && <div className="mt-4 rounded-xl border border-app-danger/30 bg-app-danger-soft px-4 py-3 text-sm text-app-danger">Không thể đăng nhập bằng Google. Vui lòng thử lại.</div>}
                    <button type="button" onClick={() => window.location.assign(portalApi.auth.googleStartUrl())} className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-soft)]">
                        <span className="text-base font-bold">G</span>Tiếp tục với Google
                    </button>
                    <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-[var(--app-border)]" /><span className="text-[11px] text-[var(--app-text-muted)]">HOẶC</span><div className="h-px flex-1 bg-[var(--app-border)]" /></div>
                    {errors.root?.message && <div className="mb-4 rounded-xl border border-app-danger/30 bg-app-danger-soft px-4 py-3 text-sm text-app-danger">{errors.root.message}</div>}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                        <Field label="Email" error={errors.email?.message} required>
                            <Input {...register("email")} type="email" autoComplete="email" aria-invalid={!!errors.email} placeholder="Nhập email" disabled={isSubmitting} />
                        </Field>
                        <div className="relative">
                            <Field label="Mật khẩu" error={errors.password?.message} required>
                                <PasswordInput {...register("password")} autoComplete="current-password" aria-invalid={!!errors.password} placeholder="Nhập mật khẩu" disabled={isSubmitting} />
                            </Field>
                            <Link to="/forgot-password" className="absolute right-0 top-0 text-xs text-[var(--app-accent)] hover:opacity-80">Quên mật khẩu?</Link>
                        </div>
                        <Button type="submit" fullWidth loading={isSubmitting}>Đăng nhập</Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-[var(--app-text-secondary)]">Chưa có tài khoản? <Link to="/register" className="font-semibold text-[var(--app-accent)] hover:opacity-80">Tạo tài khoản miễn phí</Link></p>
                </div>
            </section>
        </div>
    );
}