import { KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Callout } from "../components/Callout";

/** Đăng nhập ⇒ số key đang hoạt động + 4 số cuối (không bao giờ có key bản rõ ở đây). */
export function YourKeyLive({ fallback }: { fallback: string }) {
    const keys = useAuthStore((s) => s.user?.keys ?? null);
    if (!keys) return <Callout tone="info" text={fallback} />;
    const active = keys.filter((k) => !k.revokedAt);
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-app-accent/25 bg-app-accent-soft/50 px-4 py-3 sm:flex-row sm:items-center">
            <KeyRound className="h-4 w-4 shrink-0 text-app-accent" aria-hidden />
            <p className="flex-1 text-sm leading-6 text-app-text">
                {active.length === 0 ? "Bạn chưa có key đang hoạt động." : <>Bạn có <strong>{active.length}</strong> key đang hoạt động: {active.slice(0, 3).map((k) => <code key={k.id} className="docs-inline-code mr-1">vk_…{k.last4}</code>)}</>}
            </p>
            <Link to="/settings/api-keys" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-app-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-app-accent-hover">
                {active.length === 0 ? "Tạo key" : "Quản lý key"}
            </Link>
        </div>
    );
}
