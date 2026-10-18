import { useInView } from "@/components/media";

/** [ref, className]: lớp `reveal` + `is-visible` khi phần tử cuộn tới (IntersectionObserver dùng chung); không có observer ⇒ hiện ngay. */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMargin = "0px 0px -10% 0px") {
    const [ref, inView] = useInView<T>({ rootMargin, once: true });
    return [ref, inView ? "reveal is-visible" : "reveal"] as const;
}
