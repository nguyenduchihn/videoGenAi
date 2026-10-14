import { Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { portalApi } from "@/api/portal.api";
import { Button, ErrorPanel, Field, Input } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { ApiError, getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/auth.store";
import { AuthShell } from "./authShell";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const emailParam = params.get("email") ?? "";
    const devTokenParam = params.get("devToken");
    const navigate = useNavigate();
    const refreshMe = useAuthStore((s) => s.refreshMe);
    const { toast, withOverlay } = useFeedback();
    const [tokenErr, setTokenErr] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const [resendEmail, setResendEmail] = useState(emailParam);
    const [sent, setSent] = useState(false);
    const [resendErr, setResendErr] = useState<string | null>(null);
    const did = useRef(false);

    useEffect(() => {
        if (!token || did.current) return;
        did.current = true;
        const run = async () => {
            // firstKey (API key đầu tiên) chỉ dành cho tích hợp bên ngoài; web tạo video bằng cookie phiên nên không cần lưu.
            await portalApi.auth.verifyEmail(token);
            // Backend đã đặt cookie phiên: nạp /portal/auth/me đầy đủ (gói, số dư…) trước khi vào dashboard.
            await refreshMe().catch(() => undefined);
        };
        void withOverlay(run(), "Đang xác minh email…")
            .then(() => {
                navigate("/dashboard", { replace: true });
                toast.success("Email đã được xác minh!");
            })
            .catch((err: unknown) => {
                const c = err instanceof ApiError ? err.code : null;
                setTokenErr(c === "TOKEN_EXPIRED" ? "Liên kết đã hết hạn." : c === "TOKEN_USED" ? "Liên kết đã được sử dụng." : "Liên kết không hợp lệ.");
            });
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const startCooldown = () => {
        setCooldown(60);
        const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    };

    const handleResend = async () => {
        setResendErr(null);
        try { await portalApi.auth.resendVerification(resendEmail); setSent(true); startCooldown(); }
        catch (err) { setResendErr((err instanceof ApiError && err.status === 429) ? "Quá nhiều yêu cầu. Vui lòng đợi." : getErrorMessage(err)); }
    };

    if (token && tokenErr) return (
        <AuthShell title="Liên kết không hợp lệ" footer={<Link to="/login" className="text-[var(--app-accent)]">← Đăng nhập</Link>}>
            <ErrorPanel message={tokenErr} />
            {!emailParam && (
                <div className="mt-4">
                    <Field label="Email của bạn">
                        <Input value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} type="email" placeholder="Nhập email để gửi lại" />
                    </Field>
                </div>
            )}
            <Button fullWidth className="mt-4" onClick={handleResend} disabled={!resendEmail || cooldown > 0}>
                Gửi lại email xác minh{cooldown > 0 ? ` (${cooldown}s)` : ""}
            </Button>
        </AuthShell>
    );

    if (token) return null;

    return (
        <AuthShell title="Kiểm tra hộp thư" subtitle={emailParam ? `Chúng tôi đã gửi email xác minh đến ${emailParam}.` : "Vui lòng kiểm tra hộp thư."} footer={<Link to="/login" className="text-[var(--app-accent)]">← Đăng nhập</Link>}>
            <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--app-accent-soft)]">
                    <Mail className="h-7 w-7 text-[var(--app-accent)]" />
                </div>
            </div>
            {resendErr && <div className="mb-3 rounded-xl border border-app-danger/30 bg-app-danger-soft px-3 py-2 text-sm text-app-danger">{resendErr}</div>}
            {sent && <div className="mb-3 rounded-xl border border-app-success/30 bg-app-success-soft px-3 py-2 text-sm text-app-success">Email xác minh đã được gửi lại.</div>}
            <Button fullWidth variant="outline" onClick={handleResend} disabled={cooldown > 0}>
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại email xác minh"}
            </Button>
            {import.meta.env.DEV && devTokenParam && (
                <p className="mt-3 text-center text-xs text-[var(--app-text-muted)]">
                    <Link to={`/verify-email?token=${devTokenParam}`} className="underline">Xác minh ngay (dev)</Link>
                </p>
            )}
        </AuthShell>
    );
}