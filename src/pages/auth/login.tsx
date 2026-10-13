import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    Mail,
    Sparkles,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function Login() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => navigate("/");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        if (!normalizedEmail.includes("@")) {
            setError("Vui lòng nhập email hợp lệ.");
            return;
        }

        if (!password) {
            setError("Vui lòng nhập mật khẩu.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await authService.login({
                email: normalizedEmail,
                password,
            });

            const user = await authService.me();
            setUser(user);

            navigate("/dashboard", { replace: true });
        } catch (error: any) {
            console.error("Login error:", error);

            const errorCode = error?.response?.data?.error?.code;

            if (errorCode === "EMAIL_NOT_VERIFIED") {
                navigate(
                    `/verify-email?email=${encodeURIComponent(normalizedEmail)}`,
                );
                return;
            }

            if (errorCode === "USER_SUSPENDED") {
                setError("Tài khoản của bạn đã bị tạm khóa.");
                return;
            }

            setError("Email hoặc mật khẩu không chính xác.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            setError("");

            await authService.googleLogin();
        } catch (error) {
            console.error("Google login error:", error);
            setError(
                "Không thể đăng nhập bằng Google. Vui lòng thử lại.",
            );
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
            <div className="flex min-h-screen">
                <section className="relative hidden overflow-hidden bg-[var(--app-surface-soft)] lg:flex lg:w-[52%]">
                    <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-[var(--app-accent)]/20 blur-[120px]" />
                    <div className="absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-[var(--app-accent-hover)]/15 blur-[130px]" />

                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex w-fit items-center gap-3"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-surface)]">
                                <Sparkles className="h-[18px] w-[18px] text-[var(--app-text)]" />
                            </div>
                            <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--app-text)]">
                                VideoGen AI
                            </span>
                        </button>

                        <div className="max-w-[560px]">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]/[0.06] px-3 py-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--app-accent)]/20">
                                    <Sparkles className="h-3 w-3 text-[var(--app-accent-hover)]" />
                                </span>
                                <span className="text-xs font-medium text-[var(--app-text-secondary)]">
                                    AI Video Creation Platform
                                </span>
                            </div>

                            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--app-text)] xl:text-5xl">
                                Biến ý tưởng
                                <br />
                                thành những video
                                <span className="mt-1 block bg-gradient-to-r from-[var(--app-accent)] via-[var(--app-accent-hover)] to-[var(--app-accent)] bg-clip-text text-transparent">
                                    chuyên nghiệp.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-[470px] text-[15px] leading-7 text-[var(--app-text-muted)]">
                                Tạo nội dung video bằng AI nhanh hơn, đơn giản hơn và
                                tập trung hơn vào ý tưởng của bạn.
                            </p>

                            <div className="mt-8 space-y-3">
                                {[
                                    "Tạo video từ một ý tưởng đơn giản",
                                    "AI hỗ trợ nội dung, hình ảnh và âm thanh",
                                    "Quản lý toàn bộ dự án tại một nơi",
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-surface)]/10">
                                            <Check className="h-3.5 w-3.5 text-[var(--app-accent-hover)]" />
                                        </span>
                                        <span className="text-sm text-[var(--app-text-secondary)]">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 max-w-[500px]">
                                <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/[0.04] p-3">
                                    <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-2 pb-3">
                                        <div className="h-2 w-2 rounded-full bg-red-400/70" />
                                        <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
                                        <div className="h-2 w-2 rounded-full bg-green-400/70" />
                                        <span className="ml-2 text-[10px] text-[var(--app-text-muted)]">
                                            AI Video Workspace
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[1fr_130px] gap-3 p-2">
                                        <div className="aspect-video rounded-xl bg-gradient-to-br from-[var(--app-accent)]/20 via-[var(--app-accent-hover)]/10 to-[var(--app-accent)]/20">
                                            <div className="flex h-full items-center justify-center">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]/10">
                                                    <Sparkles className="h-4 w-4 text-[var(--app-text)]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="h-7 rounded-lg bg-[var(--app-surface)]/[0.06]" />
                                            <div className="h-12 rounded-lg bg-[var(--app-surface)]/[0.04]" />
                                            <div className="h-8 rounded-lg bg-[var(--app-accent)]/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                            <span>© 2026 VideoGen AI</span>
                            <div className="flex gap-5">
                                <button type="button" className="transition">
                                    Điều khoản
                                </button>
                                <button type="button" className="transition">
                                    Bảo mật
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)] sm:right-8 sm:top-8"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="w-full max-w-[390px]">
                        <div className="mb-10 flex justify-center lg:hidden">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex items-center gap-2.5"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-text)]">
                                    <Sparkles className="h-[18px] w-[18px] text-white" />
                                </div>
                                <span className="text-[17px] font-semibold">
                                    VideoGen AI
                                </span>
                            </button>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[var(--app-accent-hover)]">
                                Chào mừng trở lại
                            </p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
                                Đăng nhập
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                                Đăng nhập để tiếp tục quản lý và tạo video của bạn.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading || googleLoading}
                            className="mt-8 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-sm font-semibold text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {googleLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-accent)]" />
                            ) : (
                                <span className="flex h-5 w-5 items-center justify-center text-base font-bold">
                                    G
                                </span>
                            )}
                            <span>
                                {googleLoading
                                    ? "Đang chuyển đến Google..."
                                    : "Đăng nhập bằng Google"}
                            </span>
                        </button>

                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-[var(--app-border)]" />
                            <span className="text-[11px] text-[var(--app-text-muted)]">
                                HOẶC
                            </span>
                            <div className="h-px flex-1 bg-[var(--app-border)]" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-[13px] font-medium text-[var(--app-text)]"
                                >
                                    Email
                                </label>

                                <div className="relative">
                                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]">
                                        <Mail className="h-[18px] w-[18px]" />
                                    </div>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="Nhập email"
                                        autoComplete="email"
                                        required
                                        disabled={loading || googleLoading}
                                        className="h-[50px] w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] pl-11 pr-4 text-sm text-[var(--app-text)] shadow-sm outline-none transition placeholder:text-[var(--app-text-muted)] hover:border-[var(--app-border)] focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/15 disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)]"
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-[13px] font-medium text-[var(--app-text)]"
                                    >
                                        Mật khẩu
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-[var(--app-accent-hover)] transition"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="current-password"
                                        required
                                        disabled={loading || googleLoading}
                                        className="h-[50px] w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 pr-12 text-sm text-[var(--app-text)] shadow-sm outline-none transition placeholder:text-[var(--app-text-muted)] hover:border-[var(--app-border)] focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/15 disabled:cursor-not-allowed disabled:bg-[var(--app-surface-soft)]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={loading || googleLoading}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] transition hover:text-[var(--app-text)] disabled:cursor-not-allowed"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-[18px] w-[18px]" />
                                        ) : (
                                            <Eye className="h-[18px] w-[18px]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(event) =>
                                            setRememberMe(event.target.checked)
                                        }
                                        disabled={loading || googleLoading}
                                        className="h-4 w-4 rounded border-[var(--app-border)] accent-[var(--app-accent)]"
                                    />
                                    <span className="text-xs text-[var(--app-text-secondary)]">
                                        Ghi nhớ đăng nhập
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-xs leading-5 text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || googleLoading}
                                className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--app-accent-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span>
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </span>
                                {!loading && (
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                )}
                            </button>
                        </form>

                        <div className="mt-7 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-4 text-center">
                            <p className="text-sm text-[var(--app-text-secondary)]">
                                Chưa có tài khoản?
                            </p>
                            <Link
                                to="/register"
                                className="mt-1 inline-block text-sm font-semibold text-[var(--app-accent-hover)] transition"
                            >
                                Tạo tài khoản miễn phí
                            </Link>
                        </div>

                        <p className="mt-6 text-center text-[10px] leading-5 text-[var(--app-text-muted)]">
                            Bằng việc đăng nhập, bạn đồng ý với{" "}
                            <button type="button" className="underline transition">
                                Điều khoản sử dụng
                            </button>{" "}
                            và{" "}
                            <button type="button" className="underline transition">
                                Chính sách bảo mật
                            </button>
                            .
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}