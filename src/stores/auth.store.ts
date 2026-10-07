import { create } from "zustand";

import type {
    PortalMeResponse,
} from "@/types/api";

interface AuthState {
    user: PortalMeResponse | null;

    isAuthenticated: boolean;

    loading: boolean;

    setUser: (
        user: PortalMeResponse
    ) => void;

    clearUser: () => void;

    setLoading: (
        loading: boolean
    ) => void;
}

export const useAuthStore =
    create<AuthState>((set) => ({
        user: null,

        isAuthenticated: false,

        loading: false,

        setUser: (user) =>
            set({
                user,
                isAuthenticated: true,
            }),

        clearUser: () =>
            set({
                user: null,
                isAuthenticated: false,
            }),

        setLoading: (loading) =>
            set({
                loading,
            }),
    }));