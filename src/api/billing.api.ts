import api from "@/lib/api";
import type { PaymentIntent, PaymentIntentListResponse, PaymentPackagesResponse } from "@/types/api";

export async function packages(): Promise<PaymentPackagesResponse> {
    return (await api.get<PaymentPackagesResponse>("/portal/payments/packages")).data;
}
export async function createIntent(packageId: string): Promise<PaymentIntent> {
    return (await api.post<PaymentIntent>("/portal/payments/seapay/create-intent", { packageId })).data;
}
export async function intentStatus(intentId: string): Promise<PaymentIntent> {
    return (await api.get<PaymentIntent>(`/portal/payments/intents/${intentId}/status`)).data;
}
export async function intents(cursor?: string, limit = 20): Promise<PaymentIntentListResponse> {
    return (await api.get<PaymentIntentListResponse>("/portal/payments/intents", { params: { cursor, limit } })).data;
}
