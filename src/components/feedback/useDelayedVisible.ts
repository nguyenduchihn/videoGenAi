import { useEffect, useRef, useState } from "react";

export function useDelayedVisible(
    active: boolean,
    { delay = 150, minVisible = 400 }: { delay?: number; minVisible?: number } = {},
): boolean {
    const [visible, setVisible] = useState(false);
    const shownAt = useRef<number | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        clearTimeout(timer.current);
        if (active) {
            timer.current = setTimeout(() => {
                shownAt.current = Date.now();
                setVisible(true);
            }, delay);
        } else if (shownAt.current !== null) {
            const elapsed = Date.now() - shownAt.current;
            const remaining = Math.max(0, minVisible - elapsed);
            timer.current = setTimeout(() => {
                shownAt.current = null;
                setVisible(false);
            }, remaining);
        }
        return () => clearTimeout(timer.current);
    }, [active, delay, minVisible]);

    return visible;
}
