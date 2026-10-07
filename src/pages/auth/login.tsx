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

export default function Login() {
    const navigate = useNavigate();



    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [rememberMe, setRememberMe] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleClose = () => {
        navigate("/");
    };


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const normalizedEmail =
            email.trim();

        if (!normalizedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        if (!normalizedEmail.includes("@")) {
            setError(
                "Vui lòng nhập email hợp lệ."
            );
            return;
        }

        if (!password) {
            setError(
                "Vui lòng nhập mật khẩu."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            await authService.login({
                email: normalizedEmail,
                password,
            });


            navigate("/dashboard");
        } catch (error: any) {
            console.error(
                "Login error:",
                error
            );

            const errorCode =
                error?.response?.data?.error?.code;


            if (
                errorCode ===
                "EMAIL_NOT_VERIFIED"
            ) {
                navigate(
                    `/verify-email?email=${encodeURIComponent(
                        normalizedEmail
                    )}`
                );

                return;
            }


            if (
                errorCode ===
                "USER_SUSPENDED"
            ) {
                setError(
                    "Tài khoản của bạn đã bị tạm khóa."
                );

                return;
            }

            setError(
                "Email hoặc mật khẩu không chính xác."
            );
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
            console.error(
                "Google login error:",
                error
            );

            setError(
                "Không thể đăng nhập bằng Google. Vui lòng thử lại."
            );

            setGoogleLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#f6f7fb] text-gray-900">

            <div className="flex min-h-screen">

                <section className="relative hidden overflow-hidden bg-[#0b0d14] lg:flex lg:w-[52%]">



                    <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />

                    <div className="absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[130px]" />



                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                            backgroundSize:
                                "48px 48px",
                        }}
                    />


                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">


                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex w-fit items-center gap-3"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white">
                                <Sparkles className="h-[18px] w-[18px] text-gray-900" />
                            </div>

                            <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">
                                VideoGen AI
                            </span>
                        </button>


                        <div className="max-w-[560px]">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">

                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
                                    <Sparkles className="h-3 w-3 text-violet-300" />
                                </span>

                                <span className="text-xs font-medium text-gray-300">
                                    AI Video Creation Platform
                                </span>

                            </div>

                            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-5xl">

                                Biến ý tưởng
                                <br />

                                thành những video

                                <span className="mt-1 block bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
                                    chuyên nghiệp.
                                </span>

                            </h1>

                            <p className="mt-6 max-w-[470px] text-[15px] leading-7 text-gray-400">
                                Tạo nội dung video bằng AI nhanh hơn,
                                đơn giản hơn và tập trung hơn vào ý tưởng
                                của bạn.
                            </p>


                            <div className="mt-8 space-y-3">

                                <div className="flex items-center gap-3">

                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                                        <Check className="h-3.5 w-3.5 text-violet-300" />
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        Tạo video từ một ý tưởng đơn giản
                                    </span>

                                </div>

                                <div className="flex items-center gap-3">

                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                                        <Check className="h-3.5 w-3.5 text-violet-300" />
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        AI hỗ trợ nội dung, hình ảnh và âm thanh
                                    </span>

                                </div>

                                <div className="flex items-center gap-3">

                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                                        <Check className="h-3.5 w-3.5 text-violet-300" />
                                    </span>

                                    <span className="text-sm text-gray-300">
                                        Quản lý toàn bộ dự án tại một nơi
                                    </span>

                                </div>

                            </div>


                            <div className="mt-10 max-w-[500px]">

                                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3">

                                    <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-3">

                                        <div className="h-2 w-2 rounded-full bg-red-400/70" />
                                        <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
                                        <div className="h-2 w-2 rounded-full bg-green-400/70" />

                                        <span className="ml-2 text-[10px] text-gray-600">
                                            AI Video Workspace
                                        </span>

                                    </div>

                                    <div className="grid grid-cols-[1fr_130px] gap-3 p-2">

                                        <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-blue-500/20">

                                            <div className="flex h-full items-center justify-center">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10">

                                                    <Sparkles className="h-4 w-4 text-white" />

                                                </div>

                                            </div>

                                        </div>

                                        <div className="space-y-2">
                                            <div className="h-7 rounded-lg bg-white/[0.06]" />
                                            <div className="h-12 rounded-lg bg-white/[0.04]" />
                                            <div className="h-8 rounded-lg bg-violet-500/10" />
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">

                            <span>
                                © 2026 VideoGen AI
                            </span>

                            <div className="flex gap-5">

                                <button
                                    type="button"
                                    className="transition hover:text-gray-400"
                                >
                                    Điều khoản
                                </button>

                                <button
                                    type="button"
                                    className="transition hover:text-gray-400"
                                >
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
                        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 sm:right-8 sm:top-8"
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

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                                    <Sparkles className="h-[18px] w-[18px] text-white" />
                                </div>

                                <span className="text-[17px] font-semibold">
                                    VideoGen AI
                                </span>

                            </button>

                        </div>


                        <div>

                            <p className="text-sm font-medium text-violet-600">
                                Chào mừng trở lại
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                                Đăng nhập
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Đăng nhập để tiếp tục quản lý và tạo
                                video của bạn.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={
                                loading ||
                                googleLoading
                            }
                            className="mt-8 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {googleLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
                            ) : (
                                <span className="flex h-5 w-5 items-center justify-center text-base font-bold">
                                    G
                                </span>
                            )}

                            <span>
                                {googleLoading
                                    ? "Đang chuyển đến Google..."
                                    : "Tiếp tục với Google"}
                            </span>

                        </button>


                        <div className="my-6 flex items-center gap-4">

                            <div className="h-px flex-1 bg-gray-200" />

                            <span className="text-[11px] text-gray-400">
                                HOẶC
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >


                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-[13px] font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <div className="relative">

                                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">

                                        <Mail className="h-[18px] w-[18px]" />

                                    </div>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(
                                                event.target.value
                                            );

                                            if (error) {
                                                setError("");
                                            }
                                        }}
                                        placeholder="Nhập email"
                                        autoComplete="email"
                                        required
                                        disabled={
                                            loading ||
                                            googleLoading
                                        }
                                        className="h-[50px] w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />

                                </div>

                            </div>


                            <div className="mt-5">

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="text-[13px] font-medium text-gray-700"
                                    >
                                        Mật khẩu
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-violet-600 transition hover:text-violet-700"
                                    >
                                        Quên mật khẩu?
                                    </Link>

                                </div>

                                <div className="relative">

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

                                            if (error) {
                                                setError("");
                                            }
                                        }}
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="current-password"
                                        required
                                        disabled={
                                            loading ||
                                            googleLoading
                                        }
                                        className="h-[50px] w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) =>
                                                    !prev
                                            )
                                        }
                                        disabled={
                                            loading ||
                                            googleLoading
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 disabled:cursor-not-allowed"
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
                                            setRememberMe(
                                                event.target.checked
                                            )
                                        }
                                        disabled={
                                            loading ||
                                            googleLoading
                                        }
                                        className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                                    />

                                    <span className="text-xs text-gray-500">
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
                                disabled={
                                    loading ||
                                    googleLoading
                                }
                                className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                <span>
                                    {loading
                                        ? "Đang đăng nhập..."
                                        : "Đăng nhập"}
                                </span>

                                {!loading && (
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                )}

                            </button>

                        </form>



                        <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center">

                            <p className="text-sm text-gray-500">
                                Chưa có tài khoản?
                            </p>

                            <Link
                                to="/register"
                                className="mt-1 inline-block text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                            >
                                Tạo tài khoản miễn phí
                            </Link>

                        </div>


                        <p className="mt-6 text-center text-[10px] leading-5 text-gray-400">

                            Bằng việc đăng nhập, bạn đồng ý với{" "}

                            <button
                                type="button"
                                className="underline transition hover:text-gray-600"
                            >
                                Điều khoản sử dụng
                            </button>{" "}

                            và{" "}

                            <button
                                type="button"
                                className="underline transition hover:text-gray-600"
                            >
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