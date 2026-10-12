import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export type AccentColor =
    | "orange"
    | "violet"
    | "blue"
    | "green";

interface AppearanceState {
    theme: ThemeMode;
    accent: AccentColor;
    compactSidebar: boolean;

    setTheme: (theme: ThemeMode) => void;
    setAccent: (accent: AccentColor) => void;
    setCompactSidebar: (compact: boolean) => void;
}

const STORAGE_KEY = "videogen-appearance";

const defaultState = {
    theme: "light" as ThemeMode,
    accent: "orange" as AccentColor,
    compactSidebar: false,
};

function loadState() {
    if (typeof window === "undefined") {
        return defaultState;
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultState;
        }

        return {
            ...defaultState,
            ...JSON.parse(saved),
        };
    } catch {
        return defaultState;
    }
}

function saveState(state: {
    theme: ThemeMode;
    accent: AccentColor;
    compactSidebar: boolean;
}) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;

    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)")
                .matches);

    root.classList.toggle("dark", isDark);
}

function applyAccent(accent: AccentColor) {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;

    const colors: Record<
        AccentColor,
        {
            accent: string;
            hover: string;
            soft: string;
        }
    > = {
        orange: {
            accent: "#F4A261",
            hover: "#E88945",
            soft: "#FFF0E2",
        },
        violet: {
            accent: "#7c3aed",
            hover: "#6d28d9",
            soft: "#f3e8ff",
        },
        blue: {
            accent: "#2563eb",
            hover: "#1d4ed8",
            soft: "#dbeafe",
        },
        green: {
            accent: "#16a34a",
            hover: "#15803d",
            soft: "#dcfce7",
        },

    };

    const selected = colors[accent];

    root.style.setProperty(
        "--app-accent",
        selected.accent
    );

    root.style.setProperty(
        "--app-accent-hover",
        selected.hover
    );

    root.style.setProperty(
        "--app-accent-soft",
        selected.soft
    );
}

export const useAppearanceStore =
    create<AppearanceState>((set, get) => ({
        ...loadState(),

        setTheme: (theme) => {
            set({ theme });

            const state = {
                ...get(),
                theme,
            };

            saveState({
                theme: state.theme,
                accent: state.accent,
                compactSidebar: state.compactSidebar,
            });

            applyTheme(theme);
        },

        setAccent: (accent) => {
            set({ accent });

            const state = {
                ...get(),
                accent,
            };

            saveState({
                theme: state.theme,
                accent: state.accent,
                compactSidebar: state.compactSidebar,
            });

            applyAccent(accent);
        },

        setCompactSidebar: (compactSidebar) => {
            set({ compactSidebar });

            const state = {
                ...get(),
                compactSidebar,
            };

            saveState({
                theme: state.theme,
                accent: state.accent,
                compactSidebar: state.compactSidebar,
            });
        },
    }));

if (typeof window !== "undefined") {
    const initialState = loadState();

    applyTheme(initialState.theme);
    applyAccent(initialState.accent);

    if (initialState.theme === "system") {
        const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        mediaQuery.addEventListener("change", () => {
            applyTheme("system");
        });
    }
}