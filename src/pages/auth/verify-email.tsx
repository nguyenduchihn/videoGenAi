import {
    ArrowRight,
    Mail,
    RefreshCw,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const email = params.get("email") ?? "";

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResend = async () => {
        try {
            setSending(true);


            await new Promise((resolve) =>
                setTimeout(resolve, 800)
            );

            setSent(true);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f7fb]">
            <div className="flex min-h-screen items-center justify-center px-5 py-10">

                <div className="w-full max-w-[460px]">

                    <div className="mb-8 flex justify-center">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>

                            <span className="text-lg font-semibold text-gray-950">
                                VideoGen AI
                            </span>
                        </Link>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                                <Mail className="h-7 w-7 text-violet-600" />
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
                                Xác thực email
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Chúng tôi đã gửi một email xác thực
                                đến địa chỉ:
                            </p>

                            {email && (
                                <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                                    {email}
                                </p>
                            )}
                        </div>
                        <div className="mt-6 rounded-xl bg-gray-50 p-4">
                            <p className="text-center text-sm leading-6 text-gray-600">
                                Vui lòng kiểm tra hộp thư và nhấn vào
                                liên kết xác thực để kích hoạt tài khoản.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={sending}
                            className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${sending
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            />

                            {sending
                                ? "Đang gửi..."
                                : "Gửi lại email xác thực"}
                        </button>

                        {sent && (
                            <p className="mt-3 text-center text-xs font-medium text-green-600">
                                Email xác thực đã được gửi lại.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="group mt-6 flex w-full items-center justify-center gap-2 text-sm font-medium text-violet-600"
                        >
                            Quay lại đăng nhập

                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        © 2026 VideoGen AI
                    </p>
                </div>
            </div>
        </div>
    );
}