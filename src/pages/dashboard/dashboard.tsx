import {
    Activity,
    CheckCircle2,
    Clock3,
    Coins,
    Film,
    Loader2,
    Plus,
    Sparkles,
    XCircle,
    Zap,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    dashboardService,
} from "@/services/dashboard.service";

import type {
    PortalMeResponse,
    PortalTask,
    TaskStatus,
} from "@/types/api";
import GeneratorPanel from "@/components/generator/generatorPanel";

export default function Dashboard() {
    const navigate = useNavigate();

    const [me, setMe] =
        useState<PortalMeResponse | null>(
            null
        );

    const [tasks, setTasks] =
        useState<PortalTask[]>([]);

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
                setTasks(data.tasks.tasks);
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

    const recentTasks = useMemo(() => {
        return [...tasks]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ).getTime() -
                    new Date(
                        a.createdAt
                    ).getTime()
            )
            .slice(0, 5);
    }, [tasks]);

    const successCount = tasks.filter(
        (task) =>
            task.status === "succeeded"
    ).length;

    const failedCount = tasks.filter(
        (task) =>
            task.status === "failed"
    ).length;

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f9fc]">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải Dashboard...
                </div>
            </div>
        );
    }

    if (!me || error) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f9fc]">
                <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                    <XCircle className="mx-auto h-10 w-10 text-red-500" />

                    <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        Không thể tải Dashboard
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fc]">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">

                <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>
                        <p className="text-sm text-gray-500">
                            Workspace
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-gray-950">
                            Xin chào,{" "}
                            {me.user.name}
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Quản lý video AI và tài nguyên
                            của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/projects"
                            )
                        }
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-medium text-white transition hover:bg-gray-800 md:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Dự án mới
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">

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


                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.8fr]">

                    <GeneratorPanel variant="quick" />

                    <section className="mt-6 rounded-2xl border border-gray-200 bg-white">

                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

                            <div>
                                <h2 className="text-sm font-semibold text-gray-950">
                                    Hoạt động gần đây
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Các task gần đây
                                </p>
                            </div>

                            <div className="flex items-center gap-4">

                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {successCount}
                                </span>

                                <span className="flex items-center gap-1 text-xs text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    {failedCount}
                                </span>

                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">

                            {recentTasks.map(
                                (task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                    />
                                )
                            )}

                        </div>
                    </section>
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
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:rounded-2xl sm:p-5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 sm:h-10 sm:w-10 sm:rounded-xl">
                {icon}
            </div>


            <p className="mt-2 text-[10px] text-gray-500 sm:mt-4 sm:text-xs">
                {label}
            </p>


            <p className="mt-0.5 truncate text-base font-semibold text-gray-950 sm:mt-1 sm:text-xl">
                {value}
            </p>

            <p className="mt-0.5 truncate text-[9px] text-gray-400 sm:mt-1 sm:text-xs">
                {description}
            </p>
        </div>
    );
}


function TaskRow({
    task,
}: {
    task: PortalTask;
}) {
    const statusMap: Record<
        TaskStatus,
        {
            label: string;
            className: string;
            icon: ReactNode;
        }
    > = {
        pending: {
            label: "Đang chờ",
            className:
                "bg-amber-50 text-amber-700",
            icon: (
                <Clock3 className="h-3.5 w-3.5" />
            ),
        },

        processing: {
            label: "Đang xử lý",
            className:
                "bg-blue-50 text-blue-700",
            icon: (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ),
        },

        succeeded: {
            label: "Hoàn thành",
            className:
                "bg-emerald-50 text-emerald-700",
            icon: (
                <CheckCircle2 className="h-3.5 w-3.5" />
            ),
        },

        failed: {
            label: "Thất bại",
            className:
                "bg-red-50 text-red-700",
            icon: (
                <XCircle className="h-3.5 w-3.5" />
            ),
        },

        cancelled: {
            label: "Đã huỷ",
            className:
                "bg-gray-100 text-gray-600",
            icon: (
                <XCircle className="h-3.5 w-3.5" />
            ),
        },
    };

    const status =
        statusMap[task.status];

    return (
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <Film className="h-4 w-4 text-gray-500" />
                </div>

                <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-gray-900">
                        {formatWorker(
                            task.worker
                        )}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        {task.model ??
                            "Default model"}{" "}
                        •{" "}
                        {task.priceCredits} credits
                    </p>
                </div>
            </div>

            <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
            >
                {status.icon}
                {status.label}
            </span>
        </div>
    );
}

function formatWorker(
    worker: string
) {
    return worker
        .split("-")
        .map(
            (item) =>
                item.charAt(0).toUpperCase() +
                item.slice(1)
        )
        .join(" ");
}