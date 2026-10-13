
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PortalMeResponse } from "@/types/api";

interface AuthState {
    user: PortalMeResponse | null;
    isAuthenticated: boolean;
    loading: boolean;

    setUser: (user: PortalMeResponse) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            loading: true,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),

            clearUser: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                }),

            setLoading: (loading) => set({ loading }),
        }),
        {
            name: "videogen-auth",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
