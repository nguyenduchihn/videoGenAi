import { create } from "zustand";

import { me as fetchMe } from "@/api/portal.api";
import { storeRegistry } from "@/lib/storeRegistry";
import type { PortalMeResponse } from "@/types/api";
import { useAppearanceStore } from "./appearance.store";

interface AuthState {
    user: PortalMeResponse | null;
    isAuthenticated: boolean;
    setUser: (user: PortalMeResponse) => void;
    clearUser: () => void;
    /** Gọi lại /portal/auth/me (sau khi nạp tiền, tạo task, đổi key…) và cập nhật store. */
    refreshMe: () => Promise<PortalMeResponse>;
}

function getUserId(user: PortalMeResponse): string | null {
    const response = user as unknown as {
        id?: unknown;
        user?: { id?: unknown } | null;
    };

    const id = response.id ?? response.user?.id;

    return typeof id === "string" && id.trim().length > 0
        ? id
        : null;
}

function syncAppearance(user: PortalMeResponse | null) {
    useAppearanceStore.getState().loadForUser(
        user ? getUserId(user) : null,
    );
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => {
        syncAppearance(user);
        set({ user, isAuthenticated: true });
    },

    clearUser: () => {
        syncAppearance(null);
        set({ user: null, isAuthenticated: false });
    },

    refreshMe: async () => {
        const data = await fetchMe();

        syncAppearance(data);
        set({ user: data, isAuthenticated: true });

        return data;
    },
}));

storeRegistry.setClearUser(() => useAuthStore.getState().clearUser());