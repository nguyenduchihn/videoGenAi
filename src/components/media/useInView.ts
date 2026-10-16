import { useEffect, useRef, useState } from "react";

type Visibility = (visible: boolean) => void;

/** Một IntersectionObserver cho mỗi rootMargin, dùng chung cho mọi thẻ (60 thẻ ⇒ 1 observer, không phải 60). */
const observers = new Map<string, IntersectionObserver>();
const listeners = new WeakMap<Element, Visibility>();

function observerFor(rootMargin: string): IntersectionObserver {
    const existing = observers.get(rootMargin);
    if (existing) return existing;
    const created = new IntersectionObserver(
        (entries) => { for (const entry of entries) listeners.get(entry.target)?.(entry.isIntersecting); },
        { rootMargin },
    );
    observers.set(rootMargin, created);
    return created;
}

export const hasIntersectionObserver = (): boolean => typeof IntersectionObserver !== "undefined";

interface UseInViewOptions {
    /** Khoảng nhìn trước (mặc định 200 px dưới mép) ⇒ item sắp cuộn tới bắt đầu tải, item xa chưa tải. */
    rootMargin?: string;
    /** true: vào khung một lần là giữ nguyên (ảnh đã tải không bị gỡ). */
    once?: boolean;
}

/**
 * Phần tử có đang trong khung nhìn (+rootMargin) không. Trình duyệt không có IntersectionObserver (jsdom) ⇒ luôn true.
 */
export function useInView<T extends Element = HTMLDivElement>({ rootMargin = "200px 0px", once = true }: UseInViewOptions = {}): [React.RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(() => !hasIntersectionObserver());

    useEffect(() => {
        const node = ref.current;
        if (!node || !hasIntersectionObserver()) return;
        const observer = observerFor(rootMargin);
        listeners.set(node, (visible) => {
            if (visible) {
                setInView(true);
                if (once) observer.unobserve(node);
            } else if (!once) {
                setInView(false);
            }
        });
        observer.observe(node);
        return () => {
            observer.unobserve(node);
            listeners.delete(node);
        };
    }, [rootMargin, once]);

    return [ref, inView];
}
