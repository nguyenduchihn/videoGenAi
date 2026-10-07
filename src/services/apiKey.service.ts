import api from "@/services/api";

import type {
    ApiKeysResponse,
    CreateApiKeyRequest,
    CreateApiKeyResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !== "false";

export const apiKeyService = {
    async getApiKeys(): Promise<ApiKeysResponse> {
        if (USE_MOCK_API) {
            return {
                items: [],
            };
        }

        const response = await api.get<ApiKeysResponse>(
            "/portal/api-keys"
        );

        return response.data;
    },

    async createApiKey(
        payload: CreateApiKeyRequest,
    ): Promise<CreateApiKeyResponse> {
        if (USE_MOCK_API) {
            return {
                id: `mock-${Date.now()}`,
                raw: `vk_mock_${Date.now()}`,
                last4: "MOCK",
                label: payload.label,
            };
        }

        const response = await api.post<CreateApiKeyResponse>(
            "/portal/api-keys",
            payload,
        );

        return response.data;
    },

    async revokeApiKey(id: string): Promise<void> {
        if (USE_MOCK_API) {
            return;
        }

        await api.delete(`/portal/api-keys/${id}`);
    },

    async rotateApiKey(): Promise<CreateApiKeyResponse> {
        if (USE_MOCK_API) {
            return {
                id: `mock-${Date.now()}`,
                raw: `vk_mock_${Date.now()}`,
                last4: "MOCK",
                label: "Rotated key",
            };
        }

        const response = await api.post<CreateApiKeyResponse>(
            "/portal/api-keys/rotate",
        );

        return response.data;
    },
};