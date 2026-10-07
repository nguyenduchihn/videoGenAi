import { Bell, CheckCircle2, Coins } from "lucide-react";
import { useEffect, useState } from "react";

type NotificationSettings = {
    taskCompleted: boolean;
    taskFailed: boolean;
    lowCredits: boolean;
};

const STORAGE_KEY = "videogen-notification-settings";

const defaultSettings: NotificationSettings = {
    taskCompleted: true,
    taskFailed: true,
    lowCredits: true,
};

function loadSettings(): NotificationSettings {
    if (typeof window === "undefined") {
        return defaultSettings;
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultSettings;
        }

        return {
            ...defaultSettings,
            ...JSON.parse(saved),
        };
    } catch {
        return defaultSettings;
    }
}

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked
                ? "bg-[var(--app-accent)]"
                : "bg-[var(--app-border)]"
                }`}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-[22px]" : "left-0.5"
                    }`}
            />
        </button>
    );
}

function NotificationRow({
    icon: Icon,
    title,
    description,
    checked,
    onChange,
}: {
    icon: typeof Bell;
    title: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--app-border)] py-4 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]">
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--app-text)]">
                        {title}
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--app-text-secondary)]">
                        {description}
                    </p>
                </div>
            </div>

            <Toggle
                checked={checked}
                onChange={onChange}
            />
        </div>
    );
}

export default function Notifications() {
    const [settings, setSettings] =
        useState<NotificationSettings>(loadSettings);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );
    }, [settings]);

    const toggle = (
        key: keyof NotificationSettings
    ) => {
        setSettings((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-[var(--app-text)]">
                    Thông báo
                </h1>

                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                    Chọn những thông báo bạn muốn nhận.
                </p>
            </div>

            <section>
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-[var(--app-text)]">
                        Thông báo
                    </h2>
                </div>

                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4">
                    <NotificationRow
                        icon={CheckCircle2}
                        title="Tác vụ hoàn thành"
                        description="Khi video hoặc hình ảnh tạo xong."
                        checked={settings.taskCompleted}
                        onChange={() =>
                            toggle("taskCompleted")
                        }
                    />

                    <NotificationRow
                        icon={Bell}
                        title="Tác vụ thất bại"
                        description="Khi quá trình tạo nội dung gặp lỗi."
                        checked={settings.taskFailed}
                        onChange={() =>
                            toggle("taskFailed")
                        }
                    />

                    <NotificationRow
                        icon={Coins}
                        title="Credits sắp hết"
                        description="Khi số credits của bạn sắp hết."
                        checked={settings.lowCredits}
                        onChange={() =>
                            toggle("lowCredits")
                        }
                    />
                </div>
            </section>

            <div className="mt-6 rounded-lg bg-[var(--app-accent-soft)] px-4 py-3">
                <p className="text-xs text-[var(--app-text-secondary)]">
                    Các thay đổi được lưu tự động.
                </p>
            </div>
        </div>
    );
}