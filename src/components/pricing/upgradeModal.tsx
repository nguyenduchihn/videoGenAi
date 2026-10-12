import {
    Loader2,
    Sparkles,
    X,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
    useEffect,
    useState,
} from "react";

import { subscriptionService } from "@/services/subscription.service";
import type {
    PaymentIntent,
    PaymentPackage,
    PaymentPackagesResponse,
} from "@/types/api";
import PaymentModal from "../payment/paymentModal";

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(
        amount
    );
};

export default function UpgradeModal({
    open,
    onClose,
}: UpgradeModalProps) {
    const [packages, setPackages] =
        useState<PaymentPackage[]>([]);

    const [selectedPackageId, setSelectedPackageId] =
        useState<string>("");

    const [paymentIntent, setPaymentIntent] =
        useState<PaymentIntent | null>(null);

    const [isLoading, setIsLoading] =
        useState(false);

    const [isCreatingPayment, setIsCreatingPayment] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;

        const loadPackages = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response: PaymentPackagesResponse =
                    await subscriptionService.getPackages();

                if (cancelled) {
                    return;
                }

                if (!response.enabled) {
                    setPackages([]);
                    setSelectedPackageId("");
                    return;
                }

                setPackages(response.packages);


                if (response.packages.length > 0) {
                    setSelectedPackageId(
                        response.packages[0].id
                    );
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Load payment packages error:",
                    err
                );

                setError(
                    "Không thể tải danh sách gói Credits."
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadPackages();

        return () => {
            cancelled = true;
        };
    }, [open]);


    useEffect(() => {
        if (!open) {
            setPaymentIntent(null);
            setError(null);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const selectedPackage =
        packages.find(
            (item) =>
                item.id === selectedPackageId
        ) ?? null;

    /*
     * Tạo payment intent.
     */
    const handleContinue = async () => {
        if (!selectedPackage) {
            return;
        }

        setIsCreatingPayment(true);
        setError(null);

        try {
            const intent =
                await subscriptionService.createPaymentIntent(
                    {
                        packageId:
                            selectedPackage.id,
                    }
                );

            setPaymentIntent(intent);
        } catch (err) {
            console.error(
                "Create payment intent error:",
                err
            );

            setError(
                "Không thể tạo lệnh thanh toán. Vui lòng thử lại."
            );
        } finally {
            setIsCreatingPayment(false);
        }
    };


    const handleClosePayment = () => {
        setPaymentIntent(null);
    };


    const handleCreateNewPayment =
        async () => {
            if (!selectedPackage) {
                return;
            }

            const intent =
                await subscriptionService.createPaymentIntent(
                    {
                        packageId:
                            selectedPackage.id,
                    }
                );

            setPaymentIntent(intent);
        };

    const handlePaymentPaid = (
        intent: PaymentIntent
    ) => {
        console.log(
            "Payment completed:",
            intent
        );
    };

    return createPortal(
        <>

            <div className="fixed inset-0 z-[9999]">

                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />


                <div className="relative z-10 flex min-h-screen items-center justify-center p-4">

                    <div
                        className="relative flex max-h-[90vh] w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                            aria-label="Đóng"
                        >
                            <X className="h-4 w-4" />
                        </button>


                        <div className="hidden w-[42%] flex-col justify-between bg-gray-50 p-8 md:flex">
                            <div>

                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>

                                    <span className="text-sm font-semibold text-gray-900">
                                        VideoGen AI
                                    </span>
                                </div>

                                <div className="mt-14">
                                    <h2 className="text-2xl font-semibold leading-tight text-gray-900">
                                        Tạo nhiều video hơn.
                                        <br />
                                        Làm được nhiều hơn.
                                    </h2>

                                    <p className="mt-4 max-w-[280px] text-sm leading-6 text-gray-500">
                                        Nạp thêm Credits để
                                        tiếp tục tạo video
                                        AI và sử dụng các
                                        tính năng của
                                        VideoGen AI.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="mb-4 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(
                                        (item) => (
                                            <span
                                                key={item}
                                                className="text-sm text-yellow-500"
                                            >
                                                ★
                                            </span>
                                        )
                                    )}
                                </div>

                                <p className="text-xs leading-5 text-gray-500">
                                    Sử dụng VideoGen AI
                                    để biến ý tưởng
                                    thành những video
                                    chuyên nghiệp.
                                </p>
                            </div>
                        </div>


                        <div className="flex min-w-0 flex-1 flex-col p-6 md:p-8">

                            <div className="pr-8">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Nạp Credits
                                </h1>

                                <p className="mt-1 text-xs text-gray-500">
                                    Chọn gói Credits phù
                                    hợp với nhu cầu sử dụng.
                                </p>
                            </div>


                            {isLoading && (
                                <div className="flex flex-1 items-center justify-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />

                                        <p className="text-xs text-gray-500">
                                            Đang tải các gói
                                            Credits...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && error && (
                                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {!isLoading &&
                                !error &&
                                packages.length ===
                                0 && (
                                    <div className="flex flex-1 items-center justify-center py-16">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-900">
                                                Chưa có gói
                                                Credits
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Hiện tại chưa
                                                có package
                                                thanh toán
                                                khả dụng.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {!isLoading &&
                                !error &&
                                packages.length >
                                0 && (
                                    <>
                                        <div className="mt-6 space-y-3">
                                            {packages.map(
                                                (
                                                    item,
                                                    index
                                                ) => {
                                                    const selected =
                                                        selectedPackageId ===
                                                        item.id;

                                                    return (
                                                        <button
                                                            key={
                                                                item.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedPackageId(
                                                                    item.id
                                                                )
                                                            }
                                                            className={`relative flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${selected
                                                                ? "border-violet-500 bg-violet-50/50 shadow-sm"
                                                                : "border-gray-200 bg-white hover:border-gray-300"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">

                                                                <div
                                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected
                                                                        ? "border-violet-600"
                                                                        : "border-gray-300"
                                                                        }`}
                                                                >
                                                                    {selected && (
                                                                        <div className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold text-gray-900">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </span>

                                                                        {index ===
                                                                            1 && (
                                                                                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-semibold text-violet-600">
                                                                                    PHỔ BIẾN
                                                                                </span>
                                                                            )}
                                                                    </div>

                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        +
                                                                        {formatCurrency(
                                                                            item.credits
                                                                        )}{" "}
                                                                        Credits
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {formatCurrency(
                                                                        item.amountVnd
                                                                    )}{" "}
                                                                    ₫
                                                                </p>

                                                                <p className="mt-1 text-[10px] text-gray-400">
                                                                    Thanh toán một lần
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>

                                        {selectedPackage && (
                                            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Gói đã chọn
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                            {
                                                                selectedPackage.label
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
                                                                selectedPackage.credits
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 border-t border-gray-200 pt-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            Thanh toán
                                                        </span>

                                                        <span className="text-sm font-bold text-gray-900">
                                                            {formatCurrency(
                                                                selectedPackage.amountVnd
                                                            )}{" "}
                                                            ₫
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto border-t border-gray-100 pt-5">
                                            <button
                                                type="button"
                                                onClick={
                                                    handleContinue
                                                }
                                                disabled={
                                                    !selectedPackage ||
                                                    isCreatingPayment
                                                }
                                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                            >
                                                {isCreatingPayment ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Đang tạo
                                                        thanh toán...
                                                    </>
                                                ) : (
                                                    "Tiếp tục thanh toán"
                                                )}
                                            </button>

                                            <p className="mt-2 text-center text-[10px] text-gray-400">
                                                Thanh toán qua
                                                chuyển khoản
                                                ngân hàng / QR.
                                            </p>
                                        </div>
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            </div>


            {paymentIntent && (
                <PaymentModal
                    intent={paymentIntent}
                    onClose={
                        handleClosePayment
                    }
                    onPaid={
                        handlePaymentPaid
                    }
                    onCreateNew={
                        handleCreateNewPayment
                    }
                />
            )}
        </>,
        document.body
    );
}