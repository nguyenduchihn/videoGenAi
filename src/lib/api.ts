import axios from "axios";
import { toApiError } from "@/lib/errors";
import { storeRegistry } from "@/lib/storeRegistry";

/** 401 ở các route này do trang tự xử lý (form đăng nhập, MainLayout…), không chuyển hướng. */
const SKIP_REDIRECT = [
    "/portal/auth/login", "/portal/auth/register", "/portal/auth/verify-email",
    "/portal/auth/forgot-password", "/portal/auth/reset-password",
    "/portal/auth/resend-verification", "/portal/auth/me",
];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const pathOf = (url: string) => url.split("?")[0] ?? url;

/**
 * Cùng một cookie phiên HttpOnly `veo_portal` cho cả /portal/* lẫn /v1/* (API chấp nhận cookie từ web cùng origin,
 * không cần X-API-Key). API key chỉ dành cho ứng dụng tích hợp bên ngoài.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    withCredentials: true,
    headers: { Accept: "application/json" },
});

api.interceptors.response.use(
    (res) => res,
    (rawErr: unknown) => {
        const ae = toApiError(rawErr);
        const url: string = (rawErr as { config?: { url?: string } })?.config?.url ?? "";
        const isSessionRoute = url.startsWith("/v1/") || url.startsWith("/portal/");
        if (ae.status === 401 && isSessionRoute && !SKIP_REDIRECT.includes(pathOf(url))) {
            const onAuthPage = AUTH_PAGES.some((p) => window.location.pathname.startsWith(p));
            if (!onAuthPage) {
                storeRegistry.clearUser();
                storeRegistry.redirect("/login?reason=expired");
            }
        }
        return Promise.reject(ae);
    },
);

export default api;
