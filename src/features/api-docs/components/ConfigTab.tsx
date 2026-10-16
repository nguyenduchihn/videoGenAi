import { KeyRound, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { YourKeyLive } from "../live/YourKeyLive";
import { Panel, WebhookSecretPanel } from "./WebhookSecretPanel";

/** Tab "Cấu hình API key & Webhook": cá nhân hoá khi đã đăng nhập, chưa đăng nhập ⇒ mời đăng nhập. */
export function ConfigTab() {
    const loggedIn = useAuthStore((s) => s.user !== null);
    if (!loggedIn) {
        return (
            <div className="mx-auto max-w-xl rounded-2xl border border-app-border bg-app-surface p-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-app-accent-soft text-app-accent"><LogIn className="h-5 w-5" aria-hidden /></span>
                <h2 className="mt-4 text-lg font-semibold text-app-text">Đăng nhập để xem key và khoá webhook</h2>
                <p className="mt-2 text-sm leading-6 text-app-text-secondary">Tab này hiện key đang hoạt động của bạn và khoá dùng để kiểm chữ ký webhook.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/login" state={{ from: "/api-docs?tab=config" }} className="inline-flex items-center rounded-xl bg-app-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-app-accent-hover">Đăng nhập</Link>
                    <Link to="/register" className="inline-flex items-center rounded-xl border border-app-border px-5 py-2.5 text-sm font-semibold text-app-text transition hover:border-app-accent/40 hover:text-app-accent">Tạo tài khoản</Link>
                </div>
            </div>
        );
    }
    return (
        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
            <Panel icon={KeyRound} title="API key" desc="Gửi trong header X-API-Key hoặc Authorization: Bearer. Key bản rõ chỉ hiện lúc tạo.">
                <YourKeyLive fallback="" />
            </Panel>
            <WebhookSecretPanel />
        </div>
    );
}
