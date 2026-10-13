import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    const loading = useAuthStore((state) => state.loading);
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Đang kiểm tra đăng nhập...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}
