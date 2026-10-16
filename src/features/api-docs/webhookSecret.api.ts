import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface WebhookSecret {
    /** whsec_… — khoá HMAC-SHA256 để kiểm header x-veo-signature. */
    secret: string;
    createdAt: string;
}

const KEY = ["webhook-secret"] as const;

export async function getWebhookSecret(): Promise<WebhookSecret> {
    return (await api.get<WebhookSecret>("/portal/webhook-secret")).data;
}

export async function rotateWebhookSecret(): Promise<WebhookSecret> {
    return (await api.post<WebhookSecret>("/portal/webhook-secret/rotate")).data;
}

/** Chỉ gọi khi đã đăng nhập (enabled) ⇒ khách vãng lai không bị 401 chuyển hướng. */
export function useWebhookSecret(enabled: boolean) {
    return useQuery({ queryKey: KEY, queryFn: getWebhookSecret, enabled, staleTime: Infinity });
}

export function useRotateWebhookSecret() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: rotateWebhookSecret, onSuccess: (data) => qc.setQueryData(KEY, data) });
}
