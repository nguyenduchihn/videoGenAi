import { useEffect, useRef, useState } from "react";
import { acquireMediaSlot } from "./mediaQueue";
import { useInView } from "./useInView";

export type LazyPhase = "idle" | "loading" | "loaded" | "error";

/**
 * src chỉ được gắn vào <img>/<video> khi phần tử vào khung nhìn VÀ tới lượt trong hàng đợi.
 * Trả về ref gắn lên khung bọc, src đang hiệu lực (null = chưa tải), pha và hàm báo xong.
 */
export function useLazySource(src: string, rootMargin?: string) {
    const [ref, inView] = useInView<HTMLDivElement>({ rootMargin });
    const [activeSrc, setActiveSrc] = useState<string | null>(null);
    const [phase, setPhase] = useState<LazyPhase>("idle");
    const releaseRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!inView) return;
        const controller = new AbortController();
        void acquireMediaSlot(controller.signal).then((release) => {
            if (controller.signal.aborted) { release(); return; }
            releaseRef.current = release;
            setActiveSrc(src);
            setPhase("loading");
        });
        return () => {
            controller.abort();
            releaseRef.current?.();
            releaseRef.current = null;
        };
    }, [inView, src]);

    const settle = (next: Exclude<LazyPhase, "idle" | "loading">) => {
        releaseRef.current?.();
        releaseRef.current = null;
        setPhase(next);
    };

    return { ref, activeSrc, phase, settle };
}
