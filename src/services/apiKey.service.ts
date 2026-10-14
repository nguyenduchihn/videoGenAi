import { createApiKey, listApiKeys, revokeApiKey, rotateApiKey } from "@/api/portal.api";
import type { ApiKeysResponse, CreateApiKeyRequest, CreateApiKeyResponse } from "@/types/api";

export const apiKeyService = {
    getApiKeys: async (): Promise<ApiKeysResponse> => ({ items: await listApiKeys() }),
    createApiKey: (p: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => createApiKey(p.label),
    revokeApiKey: (id: string): Promise<void> => revokeApiKey(id),
    rotateApiKey: (): Promise<CreateApiKeyResponse> => rotateApiKey(),
};
