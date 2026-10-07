import {
    CreditCard,
    Mail,
    User,
    Wallet,
} from "lucide-react";

export default function Account() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white">

            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <h2 className="text-base font-semibold text-gray-900">
                    Tài khoản
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Quản lý thông tin tài khoản và gói dịch vụ
                    của bạn.
                </p>
            </div>


            <div className="divide-y divide-gray-100">

                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <User className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">
                            Tên tài khoản
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            Nguyễn Đức Chính
                        </p>
                    </div>
                </div>


                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Mail className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">
                            Email
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-900">
                            chinhkull18@gmail.com
                        </p>
                    </div>
                </div>


                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">
                            Gói hiện tại
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            Pro
                        </p>
                    </div>
                </div>

                {/* Credits */}
                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Wallet className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">
                            Credits
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            0 credits
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}