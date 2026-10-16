import { useEffect, useState } from "react";

/**
 * Mục đang đọc: mục cuối cùng có mép trên đã đi qua dải 12% đầu khung nhìn (rootMargin -12% 0 -76% 0, như seedvis).
 * IntersectionObserver ⇒ không nghe scroll; trả id mục đầu khi chưa có mục nào đi qua.
 */
export function useScrollSpy(ids: readonly string[], enabled = true): string | null {
    const [active, setActive] = useState<string | null>(ids[0] ?? null);
    const key = ids.join("|");

    useEffect(() => {
        if (!enabled || typeof IntersectionObserver === "undefined") return;
        const visible = new Map<string, boolean>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const e of entries) visible.set(e.target.id, e.isIntersecting);
                const current = ids.find((id) => visible.get(id));
                if (current) setActive(current);
            },
            { rootMargin: "-12% 0px -76% 0px", threshold: 0 },
        );
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- key gói ids
    }, [key, enabled]);

    return active;
}
