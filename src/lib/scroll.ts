export const prefersReducedMotion = (): boolean =>
    typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Cuộn lên đầu trang, mượt trừ khi người dùng tắt chuyển động. */
export function scrollToTop(): void {
    if (typeof window === "undefined" || window.scrollY === 0) return;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
