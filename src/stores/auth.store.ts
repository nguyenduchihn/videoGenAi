import { create } from "zustand";

import { me as fetchMe } from "@/api/portal.api";
import { storeRegistry } from "@/lib/storeRegistry";
import type { PortalMeResponse } from "@/types/api";

interface AuthState {
    user: PortalMeResponse | null;
    isAuthenticated: boolean;
    setUser: (user: PortalMeResponse) => void;
    clearUser: () => void;
    /** Gọi lại /portal/auth/me (sau khi nạp tiền, tạo task, đổi key…) và cập nhật store. */
    refreshMe: () => Promise<PortalMeResponse>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: true }),
    clearUser: () => set({ user: null, isAuthenticated: false }),
    refreshMe: async () => {
        const data = await fetchMe();
        set({ user: data, isAuthenticated: true });
        return data;
    },
}));

storeRegistry.setClearUser(() => useAuthStore.getState().clearUser());
