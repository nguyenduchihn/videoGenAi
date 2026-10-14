import { Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { useFeedback } from "@/hooks/useFeedback";
import { portalApi } from "@/api/portal.api";
import { useApiKeyStore } from "@/stores/apiKey.store";
import { useAuthStore } from "@/stores/auth.store";
export default function Security() {
    const navigate = useNavigate();
    const { toast, confirm, withOverlay } = useFeedback();
    const me = useAuthStore((s) => s.user);
    const clearUser = useAuthStore((s) => s.clearUser);
    const clearKey = useApiKeyStore((s) => s.clearKey);
    const email = me?.user.email ?? '';
    const handleReset = async () => {
        if (!email || !(await confirm({ title: "Gửi email đặt lại mật khẩu?", body: email }))) return;
        try {
            await withOverlay(portalApi.auth.forgotPassword(email), "Đang gửi…");
            toast.success("Email đặt lại mật khẩu đã được gửi.");
        } catch (err) {
            toast.error(err);
        }
    };
    const handleLogout = async () => {
        try {
            await portalApi.auth.logout();
        } catch {
            // Cookie có thể đã hết hạn: vẫn xoá phiên phía client và về trang đăng nhập.
        } finally {
            clearKey();
            clearUser();
            navigate("/login", { replace: true });
        }
    };
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold text-[var(--app-text)]">Bảo mật</h2>
                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">Quản lý các thiết lập bảo mật cho tài khoản của bạn.</p>
            </div>
            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div className="flex items-center gap-3 border-b border-[var(--app-border)] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]"><Lock className="h-4 w-4" /></div>
                    <div><h3 className="text-sm font-semibold text-[var(--app-text)]">Mật khẩu</h3><p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">Thay đổi mật khẩu đăng nhập của bạn.</p></div>
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-sm font-medium text-[var(--app-text)]">Đổi mật khẩu</p><p className="mt-1 text-xs text-[var(--app-text-secondary)]">Liên kết đặt lại mật khẩu sẽ được gửi đến email của bạn.</p></div>
                    <Button variant="outline" size="sm" onClick={handleReset}>Gửi email đặt lại mật khẩu</Button>
                </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                <div className="flex items-center gap-3 border-b border-[var(--app-border)] px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]"><ShieldCheck className="h-4 w-4" /></div>
                    <div><h3 className="text-sm font-semibold text-[var(--app-text)]">Phiên đăng nhập</h3><p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">Đăng xuất khỏi trình duyệt này.</p></div>
                </div>
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--app-text-secondary)]">Đăng xuất sẽ xoá phiên đăng nhập trên trình duyệt này.</p>
                    <Button variant="danger" size="sm" onClick={handleLogout}>Đăng xuất khỏi trình duyệt này</Button>
                </div>
            </section>
        </div>
    );
}