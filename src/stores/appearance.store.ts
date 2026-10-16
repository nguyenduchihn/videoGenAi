
import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export type AccentColor =
    | "orange"
    | "violet"
    | "blue"
    | "green";

export interface AccentPreset {
    title: string;
    accent: string;
    hover: string;
    soft: string;
}

const softOf = (accent: string) =>
    `color-mix(in srgb, ${accent} 18%, var(--app-surface))`;

export const ACCENT_PRESETS: Record<AccentColor, AccentPreset> = {
    orange: {
        title: "Cam",
        accent: "#f4a261",
        hover: "#e88945",
        soft: softOf("#f4a261"),
    },
    violet: {
        title: "Tím",
        accent: "#3520f5",
        hover: "#2916d9",
        soft: softOf("#3520f5"),
    },
    blue: {
        title: "Xanh dương",
        accent: "#2563eb",
        hover: "#1d4ed8",
        soft: softOf("#2563eb"),
    },
    green: {
        title: "Xanh lá",
        accent: "#16a34a",
        hover: "#15803d",
        soft: softOf("#16a34a"),
    },
};

interface AppearancePreferences {
    theme: ThemeMode;
    accent: AccentColor;
    compactSidebar: boolean;
}

interface AppearanceState extends AppearancePreferences {
    setTheme: (theme: ThemeMode) => void;
    setAccent: (accent: AccentColor) => void;
    setCompactSidebar: (compact: boolean) => void;

    loadForUser: (userId: string | null) => void;
}

const STORAGE_PREFIX = "videogen-appearance";

const DEFAULT_STATE: AppearancePreferences = {
    theme: "light",
    accent: "violet",
    compactSidebar: false,
};

let activeUserId: string | null = null;

function getStorageKey(userId: string) {
    return `${STORAGE_PREFIX}:${encodeURIComponent(userId)}`;
}

function isThemeMode(value: unknown): value is ThemeMode {
    return value === "light" || value === "dark" || value === "system";
}

function isAccentColor(value: unknown): value is AccentColor {
    return (
        value === "orange" ||
        value === "violet" ||
        value === "blue" ||
        value === "green"
    );
}

function loadState(userId: string | null): AppearancePreferences {
    if (typeof window === "undefined" || !userId) {
        return { ...DEFAULT_STATE };
    }

    try {
        const saved = localStorage.getItem(getStorageKey(userId));

        if (!saved) {
            return { ...DEFAULT_STATE };
        }

        const parsed: unknown = JSON.parse(saved);

        if (!parsed || typeof parsed !== "object") {
            return { ...DEFAULT_STATE };
        }

        const value = parsed as Partial<AppearancePreferences>;

        return {
            theme: isThemeMode(value.theme)
                ? value.theme
                : DEFAULT_STATE.theme,
            accent: isAccentColor(value.accent)
                ? value.accent
                : DEFAULT_STATE.accent,
            compactSidebar:
                typeof value.compactSidebar === "boolean"
                    ? value.compactSidebar
                    : DEFAULT_STATE.compactSidebar,
        };
    } catch {
        return { ...DEFAULT_STATE };
    }
}

function saveState(state: AppearancePreferences) {
    if (typeof window === "undefined" || !activeUserId) {
        return;
    }

    try {
        localStorage.setItem(
            getStorageKey(activeUserId),
            JSON.stringify(state),
        );
    } catch {
    }
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") {
        return;
    }

    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
}

function applyAccent(accent: AccentColor) {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    const selected = ACCENT_PRESETS[accent];

    root.style.setProperty("--app-accent", selected.accent);
    root.style.setProperty("--app-accent-hover", selected.hover);
    root.style.setProperty("--app-accent-soft", selected.soft);
}

function applyPreferences(state: AppearancePreferences) {
    applyTheme(state.theme);
    applyAccent(state.accent);
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
    ...DEFAULT_STATE,

    setTheme: (theme) => {
        set({ theme });

        const state = get();

        saveState({
            theme: state.theme,
            accent: state.accent,
            compactSidebar: state.compactSidebar,
        });

        applyTheme(theme);
    },

    setAccent: (accent) => {
        set({ accent });

        const state = get();

        saveState({
            theme: state.theme,
            accent: state.accent,
            compactSidebar: state.compactSidebar,
        });

        applyAccent(accent);
    },

    setCompactSidebar: (compactSidebar) => {
        set({ compactSidebar });

        const state = get();

        saveState({
            theme: state.theme,
            accent: state.accent,
            compactSidebar: state.compactSidebar,
        });
    },

    loadForUser: (userId) => {
        activeUserId = userId;

        const preferences = loadState(userId);

        set(preferences);
        applyPreferences(preferences);
    },
}));

if (typeof window !== "undefined") {
    applyPreferences(DEFAULT_STATE);

    const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)",
    );

    mediaQuery.addEventListener("change", () => {
        const { theme } = useAppearanceStore.getState();

        if (theme === "system") {
            applyTheme("system");
        }
    });
}
