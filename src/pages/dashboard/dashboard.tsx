import {
    Activity,
    Coins,
    Sparkles,
    XCircle,
    Zap,
} from "lucide-react";

import {
    useEffect,
    useState,
    type ReactNode,
} from "react";


import {
    dashboardService,
} from "@/services/dashboard.service";

import type { PortalMeResponse } from "@/types/api";
import GeneratorPanel from "@/components/generator/generatorPanel";
import RecentRunsPanel from "@/components/runs/RecentRunsPanel";
import { Spinner } from "@/components/ui";

export default function Dashboard() {

    const [me, setMe] =
        useState<PortalMeResponse | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const data =
                    await dashboardService.getDashboardData();

                setMe(data.me);
            } catch (err) {
                console.error(err);

                setError(
                    "Không thể tải dữ liệu Dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100dvh-var(--app-header-h))] items-center justify-center bg-[var(--app-bg)] transition-colors">
                <div className="flex items-center gap-3 text-sm text-[var(--app-text-secondary)]">
                    <Spinner size="md" />
                    Đang tải Dashboard...
                </div>
            </div>
        );
    }

    if (!me || error) {
        return (
            <div className="flex min-h-[calc(100dvh-var(--app-header-h))] items-center justify-center bg-[var(--app-bg)]">
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
                    <XCircle className="mx-auto h-10 w-10 text-[var(--app-danger)]" />

                    <h2 className="mt-4 text-lg font-semibold text-[var(--app-text)]">
                        Không thể tải Dashboard
                    </h2>

                    <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-var(--app-header-h))] bg-[var(--app-bg)] transition-colors">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">

                <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 md:flex-row md:items-center">

                    <div>
                        <p className="text-sm text-[var(--app-text-secondary)]">
                            Workspace
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
                            Xin chào,{" "}
                            {me.user.name}
                        </h1>

                        <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                            Quản lý video AI và tài nguyên
                            của bạn.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

                    <StatCard
                        icon={
                            <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                        label="Số dư"
                        value={
                            me.balance.display
                        }
                        description={`${me.user.credits.toLocaleString(
                            "vi-VN"
                        )} credits`}
                    />

                    <StatCard
                        icon={
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                        label="Task hôm nay"
                        value={String(
                            me.usage.today
                        )}
                        description={`${me.usage.last7Days} task trong 7 ngày`}
                    />

                    <StatCard
                        icon={
                            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                        label="Credit đã dùng"
                        value={me.usage.creditsSpentToday.toLocaleString(
                            "vi-VN"
                        )}
                        description={`${me.usage.creditsSpent7d.toLocaleString(
                            "vi-VN"
                        )} trong 7 ngày`}
                    />

                    <StatCard
                        icon={
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        }
                        label="Gói hiện tại"
                        value={
                            me.plan?.name ??
                            "Không có gói"
                        }
                        description={
                            me.plan
                                ? `${me.plan.maxConcurrent} task đồng thời`
                                : "Chưa có gói"
                        }
                    />
                </div>


                {/* Cùng lưới 4 cột + gap với hàng thẻ thống kê ⇒ mép cột thẳng hàng (3 cột generator, 1 cột hoạt động). */}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-4">

                    {/* GeneratorPanel trả fragment (form + kết quả) ⇒ bọc lại để không tách thành 2 ô lưới. */}
                    <div className="flex min-w-0 flex-col gap-3 sm:gap-4 xl:col-span-3">
                        <GeneratorPanel />
                    </div>

                    <RecentRunsPanel />
                </div>
            </div>
        </div>
    );
}


function StatCard({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 transition-colors sm:rounded-2xl sm:p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)] sm:h-10 sm:w-10 sm:rounded-xl">
                {icon}
            </div>


            <p className="mt-2 text-[11px] text-[var(--app-text-secondary)] sm:mt-4 sm:text-xs">
                {label}
            </p>


            <p className="mt-0.5 truncate text-base font-semibold text-[var(--app-text)] sm:mt-1 sm:text-xl">
                {value}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-[var(--app-text-muted)] sm:mt-1 sm:text-xs">
                {description}
            </p>
        </div>
    );
}
