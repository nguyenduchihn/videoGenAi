import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-dvh bg-[var(--app-bg)]">
            <Outlet />
        </div>
    );
}