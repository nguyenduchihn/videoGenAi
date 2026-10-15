import {
    Check,
    Coins,
    CreditCard,
    Database,
    Film,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles,
    Video,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { subscriptionService } from "@/services/subscription.service";

import type {
    PaymentPackage,
    PaymentPackagesResponse,
    PortalPricingResponse,
} from "@/types/api";
import { useNavigate } from "react-router";

interface WorkerInfo {
    key: string;
    label: string;
    description: string;
    icon: typeof Video;
}

const WORKER_INFO: Record<string, Omit<WorkerInfo, "key">> = {
    "text-to-video": {
        label: "Text → Video",
        description:
            "Tạo video từ mô tả bằng văn bản.",
        icon: Video,
    },

    "image-to-video": {
        label: "Image → Video",
        description:
            "Biến hình ảnh thành video chuyển động.",
        icon: ImageIcon,
    },

    "reference-images-to-video": {
        label: "Reference Images → Video",
        description:
            "Tạo video dựa trên các hình ảnh tham chiếu.",
        icon: ImageIcon,
    },

    "start-end-image-to-video": {
        label: "Start / End Image → Video",
        description:
            "Tạo video với hình ảnh đầu và cuối.",
        icon: Film,
    },

    "extend-video": {
        label: "Extend Video",
        description:
            "Mở rộng nội dung của video hiện có.",
        icon: Film,
    },

    "text-to-image": {
        label: "Text → Image",
        description:
            "Tạo hình ảnh từ prompt văn bản.",
        icon: Sparkles,
    },

    "image-to-image": {
        label: "Image → Image",
        description:
            "Biến đổi hình ảnh bằng AI.",
        icon: ImageIcon,
    },
};

function formatVnd(value: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatCredits(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
}

function getWorkerInfo(workerKey: string): WorkerInfo {
    const fallback: Omit<WorkerInfo, "key"> = {
        label: workerKey,
        description:
            "Dịch vụ AI trong hệ thống VideoGen AI.",
        icon: Sparkles,
    };

    return {
        key: workerKey,
        ...(WORKER_INFO[workerKey] ?? fallback),
    };
}

function LoadingState() {
    return (
        <div className="flex min-h-[500px] items-center justify-center bg-[var(--app-bg)]">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)]">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--app-accent)]" />
                </div>

                <p className="text-sm font-medium text-[var(--app-text)]">
                    Đang tải bảng giá
                </p>

                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                    Đang lấy thông tin giá và các gói credit...
                </p>
            </div>
        </div>
    );
}

interface ErrorStateProps {
    message: string;
    onRetry: () => void;
}

function ErrorState({
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex min-h-[500px] items-center justify-center bg-[var(--app-bg)] px-4">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-base font-semibold text-[var(--app-text)]">
                    Không thể tải bảng giá
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--app-accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--app-accent-hover)]"
                >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                </button>
            </div>
        </div>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-soft)] px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-surface)] shadow-sm">
                <Database className="h-5 w-5 text-[var(--app-text-muted)]" />
            </div>

            <h3 className="text-sm font-semibold text-[var(--app-text)]">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--app-text-secondary)]">
                {description}
            </p>
        </div>
    );
}

function WorkerPricingCard({
    workerKey,
    worker,
}: {
    workerKey: string;
    worker: {
        credits: number | null;
        models: Record<string, number>;
    };
}) {
    const info = getWorkerInfo(workerKey);
    const Icon = info.icon;

    const models = Object.entries(
        worker.models ?? {}
    );

    return (
        <div className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 transition hover:border-[var(--app-accent)]/30 hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-accent-soft)]">
                        <Icon className="h-5 w-5 text-[var(--app-accent)]" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--app-text)]">
                            {info.label}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[var(--app-text-secondary)]">
                            {info.description}
                        </p>
                    </div>
                </div>

                {worker.credits !== null && (
                    <div className="shrink-0 rounded-lg bg-[var(--app-surface-soft)] px-2.5 py-1.5 text-right">
                        <p className="text-[10px] text-[var(--app-text-muted)]">
                            Mặc định
                        </p>

                        <p className="text-xs font-semibold text-[var(--app-text)]">
                            {formatCredits(worker.credits)} credits
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-5 border-t border-[var(--app-border)] pt-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                    Model
                </p>

                {models.length === 0 ? (
                    <div className="rounded-lg bg-[var(--app-surface-soft)] px-3 py-3">
                        <p className="text-xs text-[var(--app-text-secondary)]">
                            Chưa có model được cấu hình.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {models.map(([modelName, credits]) => (
                            <div
                                key={modelName}
                                className="flex items-center justify-between rounded-lg bg-[var(--app-surface-soft)] px-3 py-2.5"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />

                                    <span className="text-xs font-medium text-[var(--app-text-secondary)]">
                                        {modelName}
                                    </span>
                                </div>

                                <span className="text-xs font-semibold text-[var(--app-text)]">
                                    {formatCredits(credits)} credits
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PackageCard({
    packageItem,
    onChoose,
    disabled,
}: {
    packageItem: PaymentPackage;
    onChoose: () => void;
    disabled: boolean;
}) {
    return (
        <div className="relative flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--app-accent)]/30 hover:shadow-lg hover:shadow-black/5">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-accent-soft)]">
                <Coins className="h-5 w-5 text-[var(--app-accent)]" />
            </div>

            <h3 className="text-lg font-semibold text-[var(--app-text)]">
                {packageItem.label}
            </h3>

            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-[var(--app-text)]">
                    {formatVnd(packageItem.amountVnd)}
                </p>

                <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                    {formatCredits(packageItem.credits)} credits
                </p>
            </div>

            <div className="mt-6 flex-1 border-t border-[var(--app-border)] pt-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <span className="text-xs text-[var(--app-text-secondary)]">
                        Credits dùng cho các tác vụ AI
                    </span>
                </div>

                <div className="mt-3 flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <span className="text-xs text-[var(--app-text-secondary)]">
                        Sử dụng theo bảng giá hiện tại
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onChoose}
                disabled={disabled}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent)] text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <CreditCard className="h-4 w-4" />
                Chọn gói
            </button>
        </div>
    );
}

export default function Pricing() {
    const navigate = useNavigate();
    const [pricing, setPricing] =
        useState<PortalPricingResponse | null>(
            null
        );

    const [packages, setPackages] =
        useState<PaymentPackagesResponse | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                pricingData,
                packagesData,
            ] = await Promise.all([
                subscriptionService.getPricing(),
                subscriptionService.getPackages(),
            ]);

            setPricing(pricingData);
            setPackages(packagesData);
        } catch (error) {
            console.error(
                "Load pricing error:",
                error
            );

            setError(
                "Không thể tải thông tin bảng giá. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={load}
            />
        );
    }

    const workers = pricing?.workers
        ? Object.entries(pricing.workers)
        : [];

    const paymentPackages =
        packages?.packages ?? [];

    const hasWorkerPricing =
        workers.length > 0;

    const hasPackages =
        paymentPackages.length > 0;

    return (
        <div className="min-h-screen bg-[var(--app-bg)] transition-colors">
            <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
                <div className="mb-10">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-accent)]/20 bg-[var(--app-accent-soft)] px-3 py-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-[var(--app-accent)]" />

                                <span className="text-xs font-medium text-[var(--app-accent)]">
                                    AI Credits
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">
                                Bảng giá
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
                                Xem chi phí sử dụng các dịch vụ AI và lựa chọn gói credits phù hợp
                                với nhu cầu của bạn.
                            </p>
                        </div>
                    </div>
                </div>

                <section>
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[var(--app-text)]">
                            Chi phí sử dụng AI
                        </h2>

                        <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                            Giá credits được lấy trực tiếp từ cấu hình pricing của hệ thống.
                        </p>
                    </div>

                    {!hasWorkerPricing ? (
                        <EmptyState
                            title="Chưa có bảng giá AI"
                            description="Hiện chưa có worker hoặc model nào được cấu hình trong hệ thống."
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {workers.map(
                                ([workerKey, worker]) => (
                                    <WorkerPricingCard
                                        key={workerKey}
                                        workerKey={workerKey}
                                        worker={worker}
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>

                <section className="mt-14">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[var(--app-text)]">
                            Gói credits
                        </h2>

                        <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
                            Chọn gói credits phù hợp với nhu cầu
                            sử dụng của bạn.
                        </p>
                    </div>

                    {packages &&
                        !packages.enabled && (
                            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

                                <div>
                                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                                        Nạp credits hiện đang tạm thời không khả dụng
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                                        Hệ thống hiện chưa bật chức năng nạp tiền.
                                        Bạn vẫn có thể xem các gói credits bên dưới.
                                    </p>
                                </div>
                            </div>
                        )}

                    {!hasPackages ? (
                        <EmptyState
                            title="Chưa có gói credits"
                            description="Hiện chưa có gói credits nào được cấu hình để hiển thị."
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {paymentPackages.map((packageItem) => (
                                <PackageCard
                                    key={packageItem.id}
                                    packageItem={packageItem}
                                    onChoose={() => navigate(`/billing?package=${packageItem.id}`)}
                                    disabled={!packages?.enabled}
                                />
                            )
                            )}
                        </div>
                    )}
                </section>

                {packages &&
                    packages.enabled &&
                    hasPackages && (
                        <section className="mt-10">
                            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 transition-colors">
                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-[var(--app-text-secondary)]" />

                                            <h2 className="text-sm font-semibold text-[var(--app-text)]">
                                                Thanh toán
                                            </h2>
                                        </div>

                                        <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--app-text-secondary)]">
                                            Thông tin thanh toán được cung cấp bởi hệ thống khi bạn
                                            tạo lệnh nạp credits.
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[var(--app-surface-soft)] px-4 py-3">
                                        <p className="text-[10px] uppercase tracking-wide text-[var(--app-text-muted)]">
                                            Mã chuyển khoản
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
                                            {packages.transferCodePrefix}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                <div className="mt-10 border-t border-[var(--app-border)] pt-6">
                    <p className="text-xs leading-5 text-[var(--app-text-muted)]">
                        Giá credits được hiển thị theo dữ liệu
                        pricing hiện tại của hệ thống. Chi phí
                        thực tế của mỗi tác vụ phụ thuộc vào
                        worker và model được sử dụng.
                    </p>
                </div>
            </div>
        </div>
    );
}