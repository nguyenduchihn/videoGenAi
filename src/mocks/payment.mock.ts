import type {
    CreatePaymentIntentRequest,
    PaymentBankInfo,
    PaymentIntent,
    PaymentIntentListResponse,
    PaymentPackagesResponse,
} from "@/types/api";

const mockBankInfo: PaymentBankInfo = {
    bank: "Vietcombank",
    bankCode: "VCB",
    accountNumber: "0123456789",
    accountName: "VIDEOGEN AI",
};

export const mockPaymentPackages: PaymentPackagesResponse = {
    enabled: true,

    bankInfo: mockBankInfo,

    transferCodePrefix: "VGAI",

    packages: [
        {
            id: "starter",
            label: "Starter",
            amountVnd: 99000,
            credits: 500,
        },
        {
            id: "pro",
            label: "Pro",
            amountVnd: 199000,
            credits: 1200,
        },
        {
            id: "business",
            label: "Business",
            amountVnd: 499000,
            credits: 3500,
        },
    ],
};

const mockIntents = new Map<string, PaymentIntent>();

const createMockQrUrl = (
    amount: number,
    code: string
) => {
    return `https://img.vietqr.io/image/${mockBankInfo.bankCode}-${mockBankInfo.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
        code
    )}&accountName=${encodeURIComponent(
        mockBankInfo.accountName
    )}`;
};

export function createMockPaymentIntent(
    payload: CreatePaymentIntentRequest
): PaymentIntent {
    const existingIntent = Array.from(
        mockIntents.values()
    ).find(
        (intent) =>
            intent.package.id === payload.packageId &&
            intent.status === "pending" &&
            !intent.expired
    );

    if (existingIntent) {
        return {
            ...existingIntent,
            isExisting: true,
        };
    }

    const selectedPackage =
        mockPaymentPackages.packages.find(
            (item) => item.id === payload.packageId
        );

    if (!selectedPackage) {
        throw new Error("PACKAGE_NOT_FOUND");
    }

    const intentId =
        `mock_intent_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const code =
        `${mockPaymentPackages.transferCodePrefix}${Date.now()
            .toString()
            .slice(-8)}`;

    const now = new Date();

    const expiresAt = new Date(
        now.getTime() + 30 * 60 * 1000
    );

    const intent: PaymentIntent = {
        intentId,
        code,

        qrImageUrl: createMockQrUrl(
            selectedPackage.amountVnd,
            code
        ),

        isExisting: false,

        status: "pending",

        expired: false,

        package: selectedPackage,

        bankInfo: mockBankInfo,

        failureReason: null,

        cancellationReason: null,

        paidAt: null,

        expiresAt: expiresAt.toISOString(),

        createdAt: now.toISOString(),
    };

    mockIntents.set(intentId, intent);

    return intent;
}

export function getMockPaymentStatus(
    intentId: string
): PaymentIntent | null {
    const intent = mockIntents.get(intentId);

    if (!intent) {
        return null;
    }


    const currentPollCount =
        Number(
            sessionStorage.getItem(
                `payment_poll_${intentId}`
            ) ?? "0"
        ) + 1;

    sessionStorage.setItem(
        `payment_poll_${intentId}`,
        String(currentPollCount)
    );

    if (
        intent.status === "pending" &&
        currentPollCount >= 3
    ) {
        const paidIntent: PaymentIntent = {
            ...intent,
            status: "paid",
            paidAt: new Date().toISOString(),
            expired: false,
        };

        mockIntents.set(
            intentId,
            paidIntent
        );

        return paidIntent;
    }

    return intent;
}

export function getMockPaymentHistory(): PaymentIntentListResponse {
    return {
        items: Array.from(
            mockIntents.values()
        ).reverse(),

        nextCursor: null,
    };
}

export function resetMockPayment(
    intentId: string
) {
    mockIntents.delete(intentId);

    sessionStorage.removeItem(
        `payment_poll_${intentId}`
    );
}