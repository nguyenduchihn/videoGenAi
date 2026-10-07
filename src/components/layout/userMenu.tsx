import {
    CreditCard,
    LogOut,
    Settings,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
    onClose: () => void;
}

export default function UserMenu({
    onClose,
}: UserMenuProps) {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    const handleLogout = () => {
        onClose();


        navigate("/login");
    };

    return (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">


            <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
                        K
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            Kull Chính
                        </p>

                        <p className="truncate text-xs text-gray-500">
                            Tài khoản Free
                        </p>
                    </div>
                </div>
            </div>


            <div className="p-1.5">
                <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                    <User className="h-4 w-4 text-gray-500" />
                    Hồ sơ
                </button>

                <button
                    type="button"
                    onClick={() => handleNavigate("/pricing")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    Gói của tôi
                </button>

                <button
                    type="button"
                    onClick={() => handleNavigate("/settings")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                    <Settings className="h-4 w-4 text-gray-500" />
                    Cài đặt
                </button>
            </div>

            <div className="border-t border-gray-100 p-1.5">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}