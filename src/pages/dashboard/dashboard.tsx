import {
    Activity,
    CheckCircle2,
    Coins,
    Film,
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

import { Link, useNavigate } from "react-router-dom";

import {
    dashboardService,
} from "@/services/dashboard.service";

import type {
    PortalMeResponse,
    PortalTask,
} from "@/types/api";
import GeneratorPanel from "@/components/generator/generatorPanel";
import { Spinner, StatusBadge } from "@/components/ui";

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

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/projects"
                            )
                        }
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] px-5 text-sm font-medium text-white transition hover:bg-[var(--app-accent-hover)] md:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Dự án mới
                    </button>
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
                        <GeneratorPanel variant="quick" />
                    </div>

                    <section className="flex min-w-0 flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-colors xl:col-span-1">

                        <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4 sm:px-6 sm:py-5">

                            <div>
                                <h2 className="text-sm font-semibold text-[var(--app-text)]">
                                    Hoạt động gần đây
                                </h2>

                                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                                    Các task gần đây
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-xs text-[var(--app-success)]">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {successCount}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-[var(--app-danger)]">
                                    <XCircle className="h-4 w-4" />
                                    {failedCount}
                                </span>
                                <Link to="/tasks" className="text-xs font-medium text-[var(--app-accent)] transition hover:underline">
                                    Xem tất cả
                                </Link>
                            </div>
                        </div>

                        {recentTasks.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]">
                                    <Film className="h-5 w-5" />
                                </div>

                                <p className="mt-4 text-sm font-medium text-[var(--app-text)]">
                                    Chưa có task nào
                                </p>

                                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                                    Nhập prompt và bấm Tạo để bắt đầu.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--app-border)]">
                                {recentTasks.map(
                                    (task) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                        />
                                    )
                                )}
                            </div>
                        )}
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


function TaskRow({ task }: { task: PortalTask }) {
    return (
        <Link
            to={`/tasks?id=${task.id}`}
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--app-surface-soft)] sm:px-5"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-soft)]">
                <Film className="h-4 w-4 text-[var(--app-text-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[var(--app-text)]">{task.worker}</p>
                    <StatusBadge status={task.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-[var(--app-text-muted)]">
                    {task.model ?? "Default model"} · {task.priceCredits} credits
                </p>
            </div>
        </Link>
    );
}