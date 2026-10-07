import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sideBar";
import { useState } from "react";
import { Outlet } from "react-router-dom";



export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <Sidebar
                open={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />

            <div className="min-h-screen lg:ml-[230px]">
                <Header
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}