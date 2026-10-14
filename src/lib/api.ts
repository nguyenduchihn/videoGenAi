import axios from "axios";
import { apiKeyStorage } from "@/lib/apiKeyStorage";
import { toApiError } from "@/lib/errors";
import { storeRegistry } from "@/lib/storeRegistry";

/** 401 ở các route này do trang tự xử lý (form đăng nhập, MainLayout…), không chuyển hướng. */
const SKIP_REDIRECT = [
    "/portal/auth/login", "/portal/auth/register", "/portal/auth/verify-email",
    "/portal/auth/forgot-password", "/portal/auth/reset-password",
    "/portal/auth/resend-verification", "/portal/auth/me",
];
const pathOf = (url: string) => url.split("?")[0] ?? url;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    withCredentials: true,
    headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
    const url = config.url ?? "";
    if (url.startsWith("/v1/")) {
        const stored = apiKeyStorage.get();
        if (stored?.raw) config.headers.set("X-API-Key", stored.raw);
        config.withCredentials = false;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (rawErr: unknown) => {
        const ae = toApiError(rawErr);
        const url: string = (rawErr as { config?: { url?: string } })?.config?.url ?? "";
        if (ae.status === 401) {
            if (url.startsWith("/v1/")) {
                storeRegistry.openConnectDialog();
            } else if (url.startsWith("/portal/")) {
                const skip = SKIP_REDIRECT.includes(pathOf(url));
                if (!skip) {
                    const onAuth = ["/login", "/register", "/forgot-password", "/reset-password"]
                        .some((p) => window.location.pathname.startsWith(p));
                    if (!onAuth) {
                        storeRegistry.clearUser();
                        storeRegistry.redirect("/login?reason=expired");
                    }
                }
            }
        }
        return Promise.reject(ae);
    },
);

export default api;
