import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { isChunkLoadError, reloadOnce } from "@/lib/staleChunkReload";

/** errorElement của router: chunk cũ sau deploy ⇒ tự tải lại; lỗi khác ⇒ trang báo lỗi có nút tải lại. */
export default function RouteErrorPage() {
    const error = useRouteError();
    const stale = isChunkLoadError(error);

    useEffect(() => {
        if (stale && reloadOnce()) window.location.reload();
    }, [stale]);

    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.";
    return (
        <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-[var(--app-text)]">
            <h1 className="text-lg font-semibold">{stale ? "Có bản cập nhật mới" : "Trang gặp lỗi"}</h1>
            <p className="max-w-md text-sm text-[var(--app-text-muted)]">
                {stale ? "Ứng dụng vừa được cập nhật, đang tải lại trang…" : message}
            </p>
            <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--app-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]"
            >
                Tải lại trang
            </button>
        </main>
    );
}
