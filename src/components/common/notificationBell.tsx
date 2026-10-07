import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Check,
    CreditCard,
    Sparkles,
    Video,
    X,
} from "lucide-react";

type NotificationType =
    | "generation"
    | "payment"
    | "system"
    | "credits";

interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

const initialNotifications: NotificationItem[] = [
    {
        id: 1,
        type: "generation",
        title: "Chào mừng đến với VideoGen AI",
        description:
            "Bạn có thể bắt đầu tạo video và hình ảnh từ workspace.",
        time: "Mới",
        read: false,
    },
    {
        id: 2,
        type: "credits",
        title: "Credits của bạn đang ở mức thấp",
        description:
            "Nâng cấp gói để có thêm credits sử dụng các model AI.",
        time: "Hôm nay",
        read: false,
    },
    {
        id: 3,
        type: "system",
        title: "VideoGen AI",
        description:
            "Workspace của bạn đã sẵn sàng để sử dụng.",
        time: "Hôm nay",
        read: true,
    },
];

function NotificationIcon({
    type,
}: {
    type: NotificationType;
}) {
    if (type === "generation") {
        return <Video className="h-4 w-4" />;
    }

    if (type === "payment") {
        return <CreditCard className="h-4 w-4" />;
    }

    if (type === "credits") {
        return <Sparkles className="h-4 w-4" />;
    }

    return <Bell className="h-4 w-4" />;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(
        initialNotifications,
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(
        (item) => !item.read,
    ).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    const markAllAsRead = () => {
        setNotifications((current) =>
            current.map((item) => ({
                ...item,
                read: true,
            })),
        );
    };

    const markAsRead = (id: number) => {
        setNotifications((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        read: true,
                    }
                    : item,
            ),
        );
    };

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            <button
                type="button"
                aria-label="Thông báo"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
                <Bell className="h-[18px] w-[18px]" />

                {unreadCount > 0 && (
                    <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                        {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">

                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Thông báo
                            </h3>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                                {unreadCount > 0
                                    ? `${unreadCount} thông báo chưa đọc`
                                    : "Bạn đã đọc tất cả"}
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-violet-600 hover:bg-violet-50"
                                >
                                    Đánh dấu đã đọc
                                </button>
                            )}

                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setOpen(false)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                    <Bell className="h-5 w-5" />
                                </div>

                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    Chưa có thông báo
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Các thông báo mới sẽ xuất hiện ở đây.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() =>
                                        markAsRead(
                                            notification.id,
                                        )
                                    }
                                    className={[
                                        "flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0",
                                        notification.read
                                            ? "bg-white hover:bg-gray-50"
                                            : "bg-violet-50/40 hover:bg-violet-50",
                                    ].join(" ")}
                                >
                                    <div
                                        className={[
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                            notification.read
                                                ? "bg-gray-100 text-gray-500"
                                                : "bg-violet-100 text-violet-600",
                                        ].join(" ")}
                                    >
                                        <NotificationIcon
                                            type={
                                                notification.type
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {notification.title}
                                            </p>

                                            {!notification.read && (
                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                                            )}
                                        </div>

                                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                            {notification.description}
                                        </p>

                                        <p className="mt-1.5 text-[10px] text-gray-400">
                                            {notification.time}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-100 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Đã xem thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}