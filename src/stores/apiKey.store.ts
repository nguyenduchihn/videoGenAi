import { create } from "zustand";
import { apiKeyStorage } from "@/lib/apiKeyStorage";
import { storeRegistry } from "@/lib/storeRegistry";
import type { StoredApiKey } from "@/types/api";

interface ApiKeyState {
    key: StoredApiKey | null;
    connectOpen: boolean;
    hydrate(): void;
    setKey(k: StoredApiKey): void;
    clearKey(): void;
    openConnectDialog(): void;
    closeConnectDialog(): void;
}

export const useApiKeyStore = create<ApiKeyState>((set) => ({
    key: null,
    connectOpen: false,

    hydrate() {
        set({ key: apiKeyStorage.get() });
    },
    setKey(k) {
        apiKeyStorage.set(k);
        set({ key: k, connectOpen: false });
    },
    clearKey() {
        apiKeyStorage.clear();
        set({ key: null });
    },
    openConnectDialog() {
        set({ connectOpen: true });
    },
    closeConnectDialog() {
        set({ connectOpen: false });
    },
}));

storeRegistry.setOpenConnectDialog(() => useApiKeyStore.getState().openConnectDialog());
