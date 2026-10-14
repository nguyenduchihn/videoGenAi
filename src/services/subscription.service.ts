import * as billingApi from "@/api/billing.api";
import { pricing } from "@/api/portal.api";
import type { CreatePaymentIntentRequest, PaymentIntent, PaymentIntentListResponse, PaymentPackagesResponse, PortalPricingResponse } from "@/types/api";

export const subscriptionService = {
    getPricing: (): Promise<PortalPricingResponse> => pricing(),
    getPackages: (): Promise<PaymentPackagesResponse> => billingApi.packages(),
    createPaymentIntent: (p: CreatePaymentIntentRequest): Promise<PaymentIntent> => billingApi.createIntent(p.packageId),
    getPaymentStatus: (id: string): Promise<PaymentIntent> => billingApi.intentStatus(id),
    getPaymentHistory: (): Promise<PaymentIntentListResponse> => billingApi.intents(),
};