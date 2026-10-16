import { useEffect, useState } from "react";
import { useAppearanceStore } from "@/stores/appearance.store";

const QUERY = "(prefers-color-scheme: dark)";
const systemPrefersDark = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;

/** Theme đang áp dụng (store `dark`/`light`/`system` + prefers-color-scheme) ⇒ chọn đúng ảnh chụp Studio, chỉ tải 1 ảnh. */
export function useIsDark(): boolean {
    const theme = useAppearanceStore((s) => s.theme);
    const [systemDark, setSystemDark] = useState(systemPrefersDark);
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
        const mq = window.matchMedia(QUERY);
        const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);
    return theme === "dark" || (theme === "system" && systemDark);
}
