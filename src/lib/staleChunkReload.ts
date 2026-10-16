const RELOAD_FLAG = "videogen:chunk-reload-at";
const RELOAD_WINDOW_MS = 60_000;

/**
 * Sau mỗi lần deploy, tab đang mở vẫn giữ index.html cũ trỏ tới chunk đã đổi hash ⇒ chuyển trang lỗi
 * "Failed to fetch dynamically imported module". Vite bắn `vite:preloadError`; tải lại trang một lần để lấy build mới.
 */
export function installStaleChunkReload(): void {
    window.addEventListener("vite:preloadError", (event) => {
        if (!reloadOnce()) return;
        event.preventDefault();
        window.location.reload();
    });
}

/** true nếu được phép tải lại (chưa tải lại trong 60 giây gần đây — tránh vòng lặp khi chunk thực sự hỏng). */
export function reloadOnce(now = Date.now()): boolean {
    try {
        const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
        if (now - last < RELOAD_WINDOW_MS) return false;
        sessionStorage.setItem(RELOAD_FLAG, String(now));
        return true;
    } catch {
        return true;
    }
}

export const isChunkLoadError = (error: unknown): boolean =>
    error instanceof Error && /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(error.message);
