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
        event: React.FormEvent<HTMLFormElement>
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

        if (!normalizedEmail.includes("@")) {
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
                `/verify-email?email=${encodeURIComponent(
                    normalizedEmail
                )}`
            );
        } catch (error: any) {
            console.error("Register error:", error);

            const errorCode =
                error?.response?.data?.error?.code;

            const errorMessage =
                error?.response?.data?.error?.message;

            if (errorCode === "EMAIL_ALREADY_EXISTS") {
                setError("Email này đã được đăng ký.");
                return;
            }

            if (errorMessage) {
                setError(errorMessage);
                return;
            }

            setError(
                "Không thể tạo tài khoản. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f8fb]">
            <div className="grid min-h-screen lg:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-[#111113] lg:block">
                    <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[100px]" />

                    <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[100px]" />

                    <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
                        <div>
                            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>

                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                                AI Video Creation
                            </p>

                            <h2 className="max-w-[520px] text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
                                Biến ý tưởng của bạn thành video.
                            </h2>

                            <p className="mt-6 max-w-[460px] text-base leading-7 text-white/55">
                                Tạo video bằng AI từ prompt, hình ảnh
                                hoặc nội dung của bạn. Nhanh chóng,
                                trực quan và chuyên nghiệp.
                            </p>
                        </div>

                        <div className="my-12 grid max-w-[560px] gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>

                                <h3 className="text-sm font-semibold text-white">
                                    AI Generation
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-white/45">
                                    Biến prompt thành video chỉ
                                    trong vài phút.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                                    <ArrowRight className="h-4 w-4 text-white" />
                                </div>

                                <h3 className="text-sm font-semibold text-white">
                                    Workflow đơn giản
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-white/45">
                                    Từ ý tưởng đến video hoàn chỉnh
                                    trong một workspace.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111113] bg-violet-500 text-[10px] font-semibold text-white">
                                    A
                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111113] bg-blue-500 text-[10px] font-semibold text-white">
                                    B
                                </div>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111113] bg-emerald-500 text-[10px] font-semibold text-white">
                                    C
                                </div>
                            </div>

                            <p className="text-xs text-white/40">
                                Sẵn sàng bắt đầu sáng tạo?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-[460px]">
                        <Link
                            to="/"
                            className="mb-10 inline-flex items-center gap-2"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>

                            <span className="text-lg font-bold tracking-tight text-gray-950">
                                VideoGen AI
                            </span>
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                                Tạo tài khoản
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Bắt đầu tạo video AI chuyên nghiệp
                                chỉ với vài bước đơn giản.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                                    <X className="h-3.5 w-3.5 text-red-600" />
                                </div>

                                <p className="text-sm leading-5 text-red-700">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-gray-800"
                                >
                                    Họ và tên
                                </label>

                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => {
                                            setName(
                                                event.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="Nhập họ và tên"
                                        autoComplete="name"
                                        maxLength={100}
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-800"
                                >
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(
                                                event.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="Nhập email của bạn"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-gray-800"
                                >
                                    Mật khẩu
                                </label>

                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />

                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(
                                                event.target.value
                                            );
                                            setError("");
                                        }}
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        disabled={loading}
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        disabled={loading}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
                                        aria-label={
                                            showPassword
                                                ? "Ẩn mật khẩu"
                                                : "Hiện mật khẩu"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-[18px] w-[18px]" />
                                        ) : (
                                            <Eye className="h-[18px] w-[18px]" />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-gray-400">
                                    Mật khẩu tối thiểu 8 ký tự.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white">
                                    <Check className="h-3.5 w-3.5 text-gray-400" />
                                </div>

                                <p className="text-xs leading-5 text-gray-500">
                                    Bằng việc đăng ký, bạn đồng ý
                                    với{" "}
                                    <Link
                                        to="/terms"
                                        className="font-medium text-gray-800 hover:text-violet-600"
                                    >
                                        Điều khoản sử dụng
                                    </Link>{" "}
                                    và{" "}
                                    <Link
                                        to="/privacy"
                                        className="font-medium text-gray-800 hover:text-violet-600"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                    .
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>
                                            Đang tạo tài khoản...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Tạo tài khoản
                                        </span>

                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                Bạn đã có tài khoản?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-gray-950 transition hover:text-violet-600"
                                >
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>

                        <p className="mt-10 text-center text-xs text-gray-400">
                            © 2026 VideoGen AI. All rights reserved.
                        </p>
                    </div>
                </div>


            </div>
        </div>
    );
}