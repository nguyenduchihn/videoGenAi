import {
    Check,
    Monitor,
    Moon,
    Sun,
} from "lucide-react";

import {
    type AccentColor,
    type ThemeMode,
    useAppearanceStore,
} from "@/stores/appearance.store";

const themeOptions: {
    value: ThemeMode;
    label: string;
    description: string;
    icon: typeof Sun;
}[] = [
        {
            value: "light",
            label: "Sáng",
            description: "Giao diện sáng mặc định",
            icon: Sun,
        },
        {
            value: "dark",
            label: "Tối",
            description: "Dễ nhìn hơn trong môi trường tối",
            icon: Moon,
        },
        {
            value: "system",
            label: "Hệ thống",
            description: "Tự động theo thiết bị",
            icon: Monitor,
        },
    ];

const accents: {
    value: AccentColor;
    title: string;
    color: string;
}[] = [
        {
            value: "orange",
            title: "Cam",
            color: "#F4A261",
        },
        {
            value: "violet",
            title: "Tím",
            color: "#7c3aed",
        },
        {
            value: "blue",
            title: "Xanh dương",
            color: "#2563eb",
        },
        {
            value: "green",
            title: "Xanh lá",
            color: "#16a34a",
        },

    ];

export default function Appearance() {
    const {
        theme,
        accent,
        setTheme,
        setAccent,
    } = useAppearanceStore();

    return (
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-[var(--app-text)]">
                    Giao diện
                </h1>

                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                    Tùy chỉnh giao diện VideoGen theo sở thích của bạn.
                </p>
            </div>

            <section className="mb-8">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-[var(--app-text)]">
                        Chủ đề
                    </h2>

                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                        Chọn giao diện sáng, tối hoặc tự động theo hệ thống.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const selected = theme === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    setTheme(option.value)
                                }
                                className={`relative rounded-xl border p-4 text-left transition ${selected
                                    ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                                    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-text-muted)]"
                                    }`}
                            >
                                {selected && (
                                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--app-accent)] text-white">
                                        <Check className="h-3 w-3" />
                                    </span>
                                )}

                                <div
                                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${selected
                                        ? "bg-[var(--app-accent)] text-white"
                                        : "bg-[var(--app-surface-soft)] text-[var(--app-text-secondary)]"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <p className="text-sm font-semibold text-[var(--app-text)]">
                                    {option.label}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
                                    {option.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--app-text)]">
                        Màu chủ đạo
                    </h3>

                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                        Chọn màu được sử dụng cho các thành phần chính.
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {accents.map((item) => {
                        const active = accent === item.value;

                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setAccent(item.value)}
                                className={[
                                    "flex items-center gap-3 rounded-xl border px-4 py-3 transition",
                                    active
                                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                                        : "border-[var(--app-border)] hover:bg-[var(--app-surface-soft)]",
                                ].join(" ")}
                            >
                                <span
                                    className="h-5 w-5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-[var(--app-surface)]"
                                    style={{
                                        backgroundColor: item.color,
                                        boxShadow: active
                                            ? `0 0 0 2px ${item.color}`
                                            : undefined,
                                    }}
                                />

                                <span className="flex-1 text-left text-sm font-medium text-[var(--app-text)]">
                                    {item.title}
                                </span>

                                {active && (
                                    <Check className="h-4 w-4 text-[var(--app-accent)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <div className="mt-6 rounded-lg bg-[var(--app-accent-soft)] px-4 py-3">
                <p className="text-xs text-[var(--app-text-secondary)]">
                    Các thay đổi được lưu tự động và áp dụng ngay lập tức.
                </p>
            </div>
        </div>
    );
}