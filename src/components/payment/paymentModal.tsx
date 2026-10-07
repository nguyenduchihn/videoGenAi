import {
    Check,
    CheckCircle2,
    Clock3,
    Copy,
    CreditCard,
    Loader2,
    RefreshCw,
    X,
    XCircle,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { subscriptionService } from "@/services/subscription.service";
import type {
    PaymentIntent
} from "@/types/api";

interface PaymentModalProps {
    intent: PaymentIntent;
    onClose: () => void;
    onPaid?: (intent: PaymentIntent) => void;
    onCreateNew?: () => Promise<void>;
}

const POLLING_INTERVAL = 5000;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
};

const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);

    const minutes = Math.floor(
        safeSeconds / 60
    );

    const remainingSeconds =
        safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const getRemainingSeconds = (
    expiresAt: string
) => {
    const expiresTime =
        new Date(expiresAt).getTime();

    const now = Date.now();

    return Math.max(
        0,
        Math.floor(
            (expiresTime - now) / 1000
        )
    );
};

export default function PaymentModal({
    intent: initialIntent,
    onClose,
    onPaid,
    onCreateNew,
}: PaymentModalProps) {
    const [intent, setIntent] =
        useState<PaymentIntent>(
            initialIntent
        );

    const [remainingSeconds, setRemainingSeconds] =
        useState(() =>
            getRemainingSeconds(
                initialIntent.expiresAt
            )
        );

    const [copiedField, setCopiedField] =
        useState<string | null>(null);

    const [isPolling, setIsPolling] =
        useState(false);

    const [isCreatingNew, setIsCreatingNew] =
        useState(false);

    const [pollError, setPollError] =
        useState<string | null>(null);

    const [hasNotifiedPaid, setHasNotifiedPaid] =
        useState(false);

    useEffect(() => {
        setIntent(initialIntent);

        setRemainingSeconds(
            getRemainingSeconds(
                initialIntent.expiresAt
            )
        );

        setPollError(null);
        setHasNotifiedPaid(false);
    }, [initialIntent]);

    useEffect(() => {
        if (
            intent.status !== "pending" ||
            intent.expired
        ) {
            return;
        }

        const timer =
            window.setInterval(() => {
                setRemainingSeconds(
                    getRemainingSeconds(
                        intent.expiresAt
                    )
                );
            }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [
        intent.status,
        intent.expired,
        intent.expiresAt,
    ]);


    useEffect(() => {
        if (
            intent.status === "pending" &&
            remainingSeconds <= 0
        ) {
            setIntent((current) => ({
                ...current,
                expired: true,
            }));
        }
    }, [
        remainingSeconds,
        intent.status,
    ]);


    const handlePaid = useCallback(
        (paidIntent: PaymentIntent) => {
            setIntent(paidIntent);

            if (!hasNotifiedPaid) {
                setHasNotifiedPaid(true);
                onPaid?.(paidIntent);
            }
        },
        [hasNotifiedPaid, onPaid]
    );

    useEffect(() => {
        if (
            intent.status !== "pending" ||
            intent.expired
        ) {
            return;
        }

        let cancelled = false;

        const checkPaymentStatus =
            async () => {
                if (cancelled) {
                    return;
                }

                setIsPolling(true);
                setPollError(null);

                try {
                    const latest =
                        await subscriptionService.getPaymentStatus(
                            intent.intentId
                        );

                    if (cancelled) {
                        return;
                    }

                    setIntent(latest);

                    if (
                        latest.status ===
                        "paid"
                    ) {
                        handlePaid(latest);
                    }
                } catch (error) {
                    if (cancelled) {
                        return;
                    }

                    console.error(
                        "Payment polling error:",
                        error
                    );

                    setPollError(
                        "Không thể kiểm tra trạng thái thanh toán. Hệ thống sẽ thử lại."
                    );
                } finally {
                    if (!cancelled) {
                        setIsPolling(false);
                    }
                }
            };


        const interval =
            window.setInterval(
                checkPaymentStatus,
                POLLING_INTERVAL
            );

        return () => {
            cancelled = true;

            window.clearInterval(
                interval
            );
        };
    }, [
        intent.intentId,
        intent.status,
        intent.expired,
        handlePaid,
    ]);

    const handleCopy = async (
        value: string,
        field: string
    ) => {
        try {
            await navigator.clipboard.writeText(
                value
            );

            setCopiedField(field);

            window.setTimeout(() => {
                setCopiedField(null);
            }, 1500);
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );
        }
    };


    const handleCreateNew = async () => {
        if (!onCreateNew) {
            return;
        }

        setIsCreatingNew(true);
        setPollError(null);

        try {
            await onCreateNew();
        } catch (error) {
            console.error(
                "Create new payment error:",
                error
            );

            setPollError(
                "Không thể tạo lệnh thanh toán mới. Vui lòng thử lại."
            );
        } finally {
            setIsCreatingNew(false);
        }
    };

    const status = intent.status;

    const isPending =
        status === "pending" &&
        !intent.expired &&
        remainingSeconds > 0;

    const isPaid =
        status === "paid";

    const isFailed =
        status === "failed";

    const isCancelled =
        status === "cancelled";

    const isExpired =
        intent.expired ||
        (
            status === "pending" &&
            remainingSeconds <= 0
        );

    const statusLabel = useMemo(() => {
        if (isPaid) {
            return "Thanh toán thành công";
        }

        if (isFailed) {
            return "Thanh toán thất bại";
        }

        if (isCancelled) {
            return "Thanh toán đã huỷ";
        }

        if (isExpired) {
            return "Lệnh thanh toán đã hết hạn";
        }

        return "Đang chờ thanh toán";
    }, [
        isPaid,
        isFailed,
        isCancelled,
        isExpired,
    ]);

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="relative flex max-h-[calc(100vh-48px)] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Thanh toán
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Nạp Credits vào tài khoản
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                <div className="overflow-y-auto px-5 py-5">

                    {isPaid && (
                        <div className="flex flex-col items-center py-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                            </div>

                            <h3 className="mt-5 text-xl font-semibold text-gray-900">
                                Thanh toán thành công
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Giao dịch của bạn đã
                                được xác nhận.
                            </p>

                            <div className="mt-6 w-full rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Gói
                                    </span>

                                    <span className="text-sm font-semibold text-gray-900">
                                        {
                                            intent
                                                .package
                                                .label
                                        }
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Credits nhận được
                                    </span>

                                    <span className="text-base font-bold text-emerald-600">
                                        +
                                        {formatCurrency(
                                            intent
                                                .package
                                                .credits
                                        )}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Số tiền
                                    </span>

                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(
                                            intent
                                                .package
                                                .amountVnd
                                        )}
                                        ₫
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    )}


                    {(isFailed ||
                        isCancelled) && (
                            <div className="flex flex-col items-center py-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                    <XCircle className="h-9 w-9 text-red-500" />
                                </div>

                                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                                    {statusLabel}
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    {intent.failureReason ??
                                        intent.cancellationReason ??
                                        "Giao dịch không thể hoàn tất."}
                                </p>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}


                    {isExpired &&
                        !isPaid &&
                        !isFailed &&
                        !isCancelled && (
                            <div className="flex flex-col items-center py-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                                    <Clock3 className="h-9 w-9 text-amber-500" />
                                </div>

                                <h3 className="mt-5 text-xl font-semibold text-gray-900">
                                    Lệnh thanh toán đã hết hạn
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                    Vui lòng tạo một
                                    lệnh thanh toán
                                    mới để tiếp tục.
                                </p>

                                {pollError && (
                                    <div className="mt-4 w-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                        {
                                            pollError
                                        }
                                    </div>
                                )}

                                {onCreateNew && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateNew
                                        }
                                        disabled={
                                            isCreatingNew
                                        }
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isCreatingNew ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4" />
                                                Tạo lệnh mới
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}


                    {isPending && (
                        <>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Gói đã chọn
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                            {
                                                intent
                                                    .package
                                                    .label
                                            }
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            Credits
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-violet-600">
                                            +
                                            {formatCurrency(
                                                intent
                                                    .package
                                                    .credits
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Số tiền
                                        </span>

                                        <span className="text-base font-bold text-gray-900">
                                            {formatCurrency(
                                                intent
                                                    .package
                                                    .amountVnd
                                            )}
                                            ₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col items-center">
                                <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                                    <img
                                        src={
                                            intent.qrImageUrl
                                        }
                                        alt="QR thanh toán"
                                        className="h-[220px] w-[220px] object-contain"
                                    />
                                </div>

                                <p className="mt-3 text-center text-xs text-gray-500">
                                    Quét mã QR bằng ứng dụng
                                    ngân hàng để thanh toán
                                </p>
                            </div>

                            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                                <Clock3 className="h-4 w-4 text-amber-600" />

                                <span className="text-sm text-amber-700">
                                    Thời gian còn lại
                                </span>

                                <span className="font-mono text-sm font-bold text-amber-800">
                                    {formatTime(
                                        remainingSeconds
                                    )}
                                </span>
                            </div>

                            <div className="mt-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-gray-500" />

                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Thông tin chuyển khoản
                                    </h3>
                                </div>

                                <div className="overflow-hidden rounded-xl border border-gray-200">

                                    <PaymentInfoRow
                                        label="Ngân hàng"
                                        value={
                                            intent
                                                .bankInfo
                                                .bank
                                        }
                                    />

                                    <PaymentInfoRow
                                        label="Số tài khoản"
                                        value={
                                            intent
                                                .bankInfo
                                                .accountNumber
                                        }
                                        copyValue={
                                            intent
                                                .bankInfo
                                                .accountNumber
                                        }
                                        copyField="accountNumber"
                                        copiedField={
                                            copiedField
                                        }
                                        onCopy={
                                            handleCopy
                                        }
                                    />

                                    <PaymentInfoRow
                                        label="Chủ tài khoản"
                                        value={
                                            intent
                                                .bankInfo
                                                .accountName
                                        }
                                    />

                                    <PaymentInfoRow
                                        label="Nội dung CK"
                                        value={intent.code}
                                        copyValue={
                                            intent.code
                                        }
                                        copyField="code"
                                        copiedField={
                                            copiedField
                                        }
                                        onCopy={
                                            handleCopy
                                        }
                                        highlight
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                <p className="text-xs leading-5 text-blue-700">
                                    Vui lòng chuyển đúng
                                    số tiền và giữ nguyên
                                    nội dung chuyển khoản
                                    để hệ thống tự động xác
                                    nhận giao dịch.
                                </p>
                            </div>

                            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                                {isPolling ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                                        <span>
                                            Đang kiểm tra
                                            thanh toán...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                        <span>
                                            Hệ thống sẽ tự động
                                            kiểm tra giao dịch
                                        </span>
                                    </>
                                )}
                            </div>

                            {pollError && (
                                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
                                    {pollError}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {isPending && (
                    <div className="shrink-0 border-t border-gray-100 px-5 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


interface PaymentInfoRowProps {
    label: string;
    value: string;
    copyValue?: string;
    copyField?: string;
    copiedField?: string | null;
    onCopy?: (
        value: string,
        field: string
    ) => void;
    highlight?: boolean;
}

function PaymentInfoRow({
    label,
    value,
    copyValue,
    copyField,
    copiedField,
    onCopy,
    highlight = false,
}: PaymentInfoRowProps) {
    const canCopy =
        Boolean(copyValue && copyField && onCopy);

    const isCopied =
        copyField !== undefined &&
        copiedField === copyField;

    return (
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
            <span className="shrink-0 text-xs text-gray-500">
                {label}
            </span>

            <div className="flex min-w-0 items-center gap-2">
                <span
                    className={`truncate text-right text-sm font-medium ${highlight
                        ? "font-semibold text-violet-600"
                        : "text-gray-900"
                        }`}
                >
                    {value}
                </span>

                {canCopy && (
                    <button
                        type="button"
                        onClick={() =>
                            onCopy?.(
                                copyValue!,
                                copyField!
                            )
                        }
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        title="Sao chép"
                    >
                        {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}