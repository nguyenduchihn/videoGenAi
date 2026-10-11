import {
    KeyRound,
    Lock,
    Monitor,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const settingsItems = [
    {
        title: "Giao diện",
        description: "Tùy chỉnh giao diện",
        icon: Monitor,
        path: "/settings/appearance",
    },
    {
        title: "Bảo mật",
        description: "Mật khẩu & bảo mật",
        icon: Lock,
        path: "/settings/security",
    },
    {
        title: "API Keys",
        description: "Quản lý API Key",
        icon: KeyRound,
        path: "/settings/api-keys",
    },
];

export default function Settings() {
    return (
        <div className="min-h-full bg-[var(--app-bg)] transition-colors">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--app-text)]">
                        Cài đặt
                    </h1>

                    <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                        Quản lý tùy chỉnh tài khoản và trải nghiệm sử dụng.
                    </p>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors">
                    <nav className="flex overflow-x-auto">
                        {settingsItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        [
                                            "relative flex min-w-[170px] flex-1 items-center gap-3 px-4 py-4 transition sm:px-5",
                                            "border-r border-[var(--app-border)] last:border-r-0",
                                            isActive
                                                ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                                                : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]",
                                        ].join(" ")
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div
                                                className={[
                                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                    isActive
                                                        ? "bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
                                                        : "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]",
                                                ].join(" ")}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {item.title}
                                                </p>

                                                <p
                                                    className={[
                                                        "mt-0.5 whitespace-nowrap text-[11px]",
                                                        isActive
                                                            ? "text-[var(--app-accent)]"
                                                            : "text-[var(--app-text-muted)]",
                                                    ].join(" ")}
                                                >
                                                    {item.description}
                                                </p>
                                            </div>

                                            {isActive && (
                                                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[var(--app-accent)]" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <main className="mt-6 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}