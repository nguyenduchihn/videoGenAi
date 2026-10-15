import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { FeedbackHost } from "@/components/feedback/FeedbackHost";
import { OverlayLoader } from "@/components/feedback/OverlayLoader";

/** Bọc mọi route: Suspense cho chunk trang (popup tải), overlay/toast/confirm/dialog kết nối key dùng chung, có RouterContext cho Link. */
export default function RootLayout() {
    return (
        <>
            <Suspense fallback={<OverlayLoader message="Đang tải trang…" blocking />}>
                <Outlet />
            </Suspense>
            <FeedbackHost />
        </>
    );
}
