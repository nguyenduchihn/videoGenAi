const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Cuộn tới mục (tôn trọng prefers-reduced-motion), cập nhật #hash giữ nguyên ?query, chuyển focus vào tiêu đề cho trình đọc màn hình. */
export function scrollToSection(id: string, opts: { instant?: boolean } = {}): void {
    const el = document.getElementById(id);
    if (!el) return;
    // "instant" chứ không "auto": index.css đặt scroll-behavior: smooth ⇒ "auto" vẫn cuộn mượt
    el.scrollIntoView({ behavior: opts.instant || prefersReducedMotion() ? "instant" : "smooth", block: "start" });
    history.replaceState(history.state, "", `${location.pathname}${location.search}#${id}`);
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
}
