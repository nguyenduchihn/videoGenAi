import api from "@/services/api";
import { mockPricingResponse } from "@/mocks/pricing.mock";
import {
    createMockPaymentIntent,
    getMockPaymentHistory,
    getMockPaymentStatus,
    mockPaymentPackages,
} from "@/mocks/payment.mock";

import type {
    CreatePaymentIntentRequest,
    PaymentIntent,
    PaymentIntentListResponse,
    PaymentPackagesResponse,
    PortalPricingResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !== "false";

export const subscriptionService = {
    async getPricing(): Promise<PortalPricingResponse> {
        if (USE_MOCK_API) {
            return mockPricingResponse;
        }

        const response =
            await api.get<PortalPricingResponse>(
                "/portal/pricing"
            );

        return response.data;
    },

    async getPackages(): Promise<PaymentPackagesResponse> {
        if (USE_MOCK_API) {
            return mockPaymentPackages;
        }

        const response =
            await api.get<PaymentPackagesResponse>(
                "/portal/payments/packages"
            );

        return response.data;
    },

    async createPaymentIntent(
        payload: CreatePaymentIntentRequest
    ): Promise<PaymentIntent> {
        if (USE_MOCK_API) {
            return createMockPaymentIntent(payload);
        }

        const response =
            await api.post<PaymentIntent>(
                "/portal/payments/seapay/create-intent",
                payload
            );

        return response.data;
    },

    async getPaymentStatus(
        intentId: string
    ): Promise<PaymentIntent> {
        if (USE_MOCK_API) {
            const result =
                getMockPaymentStatus(intentId);

            if (!result) {
                throw new Error(
                    "PAYMENT_INTENT_NOT_FOUND"
                );
            }

            return result;
        }

        const response =
            await api.get<PaymentIntent>(
                `/portal/payments/intents/${intentId}/status`
            );

        return response.data;
    },

    async getPaymentHistory(): Promise<PaymentIntentListResponse> {
        if (USE_MOCK_API) {
            return getMockPaymentHistory();
        }

        const response =
            await api.get<PaymentIntentListResponse>(
                "/portal/payments/intents"
            );

        return response.data;
    },
};