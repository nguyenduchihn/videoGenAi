import * as portalApi from "@/api/portal.api";
import type { LoginRequest, LoginResponse, PortalMeResponse, RegisterRequest, RegisterResponse } from "@/types/api";

export const authService = {
    login: (p: LoginRequest): Promise<LoginResponse> => portalApi.login(p),
    register: (p: RegisterRequest): Promise<RegisterResponse> => portalApi.register(p),
    me: (): Promise<PortalMeResponse> => portalApi.me(),
    logout: (): Promise<void> => portalApi.logout(),
    googleLogin(): void {
        window.location.href = portalApi.googleStartUrl();
    },
};