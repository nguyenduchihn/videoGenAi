import api from "@/services/api";

import {
    mockMeResponse,
} from "@/mocks/auth.mock";

import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    PortalMeResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !==
    "false";

export const authService = {
    async login(payload: LoginRequest): Promise<LoginResponse> {
        if (USE_MOCK_API) {
            return {
                ok: true,
            };
        }

        const response =
            await api.post<LoginResponse>(
                "/portal/auth/login",
                payload
            );

        return response.data;
    },

    async googleLogin(): Promise<void> {

        window.location.href =
            `${import.meta.env.VITE_API_BASE_URL}/portal/auth/google`;
    },


    async register(
        payload: RegisterRequest
    ): Promise<RegisterResponse> {
        if (USE_MOCK_API) {
            return {
                ok: true,
                email: payload.email,
                devToken: null,
            };
        }

        const response =
            await api.post<RegisterResponse>(
                "/portal/auth/register",
                payload
            );

        return response.data;
    },

    async me(): Promise<PortalMeResponse> {
        if (USE_MOCK_API) {
            return mockMeResponse;
        }

        const response =
            await api.get<PortalMeResponse>(
                "/portal/auth/me"
            );

        return response.data;
    },

    async logout(): Promise<void> {
        if (USE_MOCK_API) {
            return;
        }

        await api.post(
            "/portal/auth/logout"
        );
    },
};