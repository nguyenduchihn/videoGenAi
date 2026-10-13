import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Sparkles,
    User,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();

        if (!normalizedName) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        if (normalizedName.length > 100) {
            setError("Họ và tên không được vượt quá 100 ký tự.");
            return;
        }

        if (!normalizedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Vui lòng nhập email hợp lệ.");
            return;
        }

        if (!password) {
            setError("Vui lòng nhập mật khẩu.");
            return;
        }

        if (password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await authService.register({
                name: normalizedName,
                email: normalizedEmail,
                password,
            });

            navigate(
                `/verify-email?email=${encodeURIComponent(normalizedEmail)}`,
            );
        } catch (error: any) {
            console.error("Register error:", error);

            const errorCode = error?.response?.data?.error?.code;
            const errorMessage = error?.response?.data?.error?.message;

            if (errorCode === "EMAIL_ALREADY_EXISTS") {
                setError("Email này đã được đăng ký.");
                return;
            }

            setError(
                errorMessage || "Không thể tạo tài khoản. Vui lòng thử lại.",
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/15 disabled:cursor-not-allowed disabled:opacity-60";

    const labelClass =
        "mb-2 block text-sm font-medium text-[var(--app-text)]";

    return (
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
            <div className="grid min-h-screen lg:grid-cols-2">
                <section className="relative hidden overflow-hidden border-r border-[var(--app-border)] bg-[var(--app-surface-soft)] lg:block">
                    <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[var(--app-accent)]/20 blur-[100px]" />
                    <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-[var(--app-accent-hover)]/15 blur-[100px]" />

                    <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
                        <div>
                            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                                <Sparkles className="h-5 w-5 text-[var(--app-accent-hover)]" />
                            </div>

                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-accent-hover)]">
                                AI Video Creation
                            </p>

                            <h2 className="max-w-[520px] text-4xl font-semibold leading-[1.15] tracking-tight text-[var(--app-text)] xl:text-5xl">
                                Biến ý tưởng của bạn thành video.
                            </h2>

                            <p className="mt-6 max-w-[460px] text-base leading-7 text-[var(--app-text-secondary)]">
                                Tạo video bằng AI từ prompt, hình ảnh hoặc nội dung của
                                bạn. Nhanh chóng, trực quan và chuyên nghiệp.
                            </p>
                        </div>

                        <div className="my-12 grid max-w-[560px] gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 p-5 backdrop-blur-sm">
                                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent-soft)]">
                                    <Sparkles className="h-4 w-4 text-[var(--app-accent-hover)]" />
                                </div>

                                <h3 className="text-sm font-semibold text-[var(--app-text)]">
                                    AI Generation
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                                    Biến prompt thành video chỉ trong vài phút.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]/80 p-5 backdrop-blur-sm">
                                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent-soft)]">
                                    <ArrowRight className="h-4 w-4 text-[var(--app-accent-hover)]" />
                                </div>

                                <h3 className="text-sm font-semibold text-[var(--app-text)]">
                                    Workflow đơn giản
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-[var(--app-text-secondary)]">
                                    Từ ý tưởng đến video hoàn chỉnh trong một workspace.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {["A", "B", "C"].map((item) => (
                                    <div
                                        key={item}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--app-surface-soft)] bg-[var(--app-accent-soft)] text-[10px] font-semibold text-[var(--app-text)]"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-[var(--app-text-secondary)]">
                                Sẵn sàng bắt đầu sáng tạo?
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-[460px]">
                        <Link to="/" className="mb-10 inline-flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent)]">
                                <Sparkles className="h-4 w-4 text-[var(--app-text)]" />
                            </div>

                            <span className="text-lg font-bold tracking-tight text-[var(--app-text)]">
                                VideoGen AI
                            </span>
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
                                Tạo tài khoản
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                                Bắt đầu tạo video AI chuyên nghiệp chỉ với vài bước đơn
                                giản.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-5 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40"
                            >
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                                    <X className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
                                </div>

                                <p className="text-sm leading-5 text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className={labelClass}>
                                    Họ và tên
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-text-muted)]" />

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => {
                                            setName(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Nhập họ và tên"
                                        autoComplete="name"
                                        maxLength={100}
                                        required
                                        disabled={loading}
                                        className={`${inputClass} pl-11 pr-4`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-text-muted)]" />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Nhập email của bạn"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className={`${inputClass} pl-11 pr-4`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={labelClass}>
                                    Mật khẩu
                                </label>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--app-text-muted)]" />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        disabled={loading}
                                        className={`${inputClass} pl-11 pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={loading}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] transition hover:text-[var(--app-text)] disabled:cursor-not-allowed"
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-[18px] w-[18px]" />
                                        ) : (
                                            <Eye className="h-[18px] w-[18px]" />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                                    Mật khẩu tối thiểu 8 ký tự.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-surface)]">
                                    <Check className="h-3.5 w-3.5 text-[var(--app-accent-hover)]" />
                                </div>

                                <p className="text-xs leading-5 text-[var(--app-text-secondary)]">
                                    Bằng việc đăng ký, bạn đồng ý với{" "}
                                    <Link
                                        to="/terms"
                                        className="font-medium text-[var(--app-text)] transition hover:text-[var(--app-accent-hover)]"
                                    >
                                        Điều khoản sử dụng
                                    </Link>{" "}
                                    và{" "}
                                    <Link
                                        to="/privacy"
                                        className="font-medium text-[var(--app-text)] transition hover:text-[var(--app-accent-hover)]"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                    .
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] text-sm font-semibold text-[#292524] transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#292524]/30 border-t-[#292524]" />
                                        <span>Đang tạo tài khoản...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Tạo tài khoản</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-[var(--app-text-secondary)]">
                                Bạn đã có tài khoản?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-[var(--app-text)] transition hover:text-[var(--app-accent-hover)]"
                                >
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>

                        <p className="mt-10 text-center text-xs text-[var(--app-text-muted)]">
                            © 2026 VideoGen AI. All rights reserved.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}