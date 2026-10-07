import {
    Bell,
    KeyRound,
    Lock,
    Monitor,
    User,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const settingsItems = [
    {
        title: "Tài khoản",
        description: "Thông tin tài khoản",
        icon: User,
        path: "/settings",
        end: true,
    },
    {
        title: "Giao diện",
        description: "Tùy chỉnh giao diện",
        icon: Monitor,
        path: "/settings/appearance",
        end: false,
    },
    {
        title: "Thông báo",
        description: "Quản lý thông báo",
        icon: Bell,
        path: "/settings/notifications",
        end: false,
    },
    {
        title: "Bảo mật",
        description: "Mật khẩu & bảo mật",
        icon: Lock,
        path: "/settings/security",
        end: false,
    },
    {
        title: "API Keys",
        description: "Quản lý API Key",
        icon: KeyRound,
        path: "/settings/api-keys",
        end: false,
    },
];

export default function Settings() {
    return (
        <div className="min-h-full bg-[#f8f9fc]">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <div>
                    <h1 className="text-xl font-semibold text-gray-950">
                        Cài đặt
                    </h1>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <nav className="flex overflow-x-auto">
                        {settingsItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [
                                            "relative flex min-w-[150px] flex-1 items-center gap-3 px-4 py-4 transition",
                                            "border-r border-gray-100 last:border-r-0",
                                            isActive
                                                ? "bg-violet-50 text-violet-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        ].join(" ")
                                    }
                                >
                                    {({ isActive }) => (
                                        <>

                                            <div
                                                className={[
                                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                                    isActive
                                                        ? "bg-violet-100 text-violet-600"
                                                        : "bg-gray-100 text-gray-500",
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
                                                            ? "text-violet-500"
                                                            : "text-gray-400",
                                                    ].join(" ")}
                                                >
                                                    {item.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-violet-600" />
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