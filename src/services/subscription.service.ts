import * as billingApi from "@/api/billing.api";
import { pricing } from "@/api/portal.api";
import type { CreatePaymentIntentRequest, PaymentIntent, PaymentIntentListResponse, PortalPricingResponse } from "@/types/api";

export const subscriptionService = {
    /** Công khai: bảng giá + gói nạp + cờ bật/tắt nạp tiền (không cần đăng nhập). */
    getPricing: (): Promise<PortalPricingResponse> => pricing(),
    createPaymentIntent: (p: CreatePaymentIntentRequest): Promise<PaymentIntent> => billingApi.createIntent(p.packageId),
    getPaymentStatus: (id: string): Promise<PaymentIntent> => billingApi.intentStatus(id),
    getPaymentHistory: (): Promise<PaymentIntentListResponse> => billingApi.intents(),
};
