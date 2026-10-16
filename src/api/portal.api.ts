import api from "@/lib/api";
import type {
    ApiKey,
    CreateApiKeyResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GetTasksParams,
    LoginRequest,
    LoginResponse,
    PortalLedgerResponse,
    PortalMeResponse,
    PortalPricingResponse,
    PortalTask,
    PortalTasksResponse,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    ResendVerificationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
} from "@/types/api";

export async function login(p: LoginRequest): Promise<LoginResponse> {
    return (await api.post<LoginResponse>("/portal/auth/login", p)).data;
}
export async function register(p: RegisterRequest): Promise<RegisterResponse> {
    return (await api.post<RegisterResponse>("/portal/auth/register", p)).data;
}
export async function logout(): Promise<void> {
    await api.post("/portal/auth/logout");
}
export async function me(): Promise<PortalMeResponse> {
    return (await api.get<PortalMeResponse>("/portal/auth/me")).data;
}
export async function verifyEmail(p: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return (await api.post<VerifyEmailResponse>("/portal/auth/verify-email", p)).data;
}
export async function resendVerification(p: ResendVerificationRequest): Promise<ResendVerificationResponse> {
    return (await api.post<ResendVerificationResponse>("/portal/auth/resend-verification", p)).data;
}
export async function forgotPassword(p: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return (await api.post<ForgotPasswordResponse>("/portal/auth/forgot-password", p)).data;
}
export async function resetPassword(p: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return (await api.post<ResetPasswordResponse>("/portal/auth/reset-password", p)).data;
}
export function googleStartUrl(): string {
    return `${import.meta.env.VITE_API_BASE_URL ?? ""}/portal/auth/google/start`;
}

export async function listApiKeys(): Promise<ApiKey[]> {
    const r = await api.get<ApiKey[] | { items: ApiKey[] }>("/portal/api-keys");
    return Array.isArray(r.data) ? r.data : (r.data.items ?? []);
}
export async function createApiKey(label: string): Promise<CreateApiKeyResponse> {
    return (await api.post<CreateApiKeyResponse>("/portal/api-keys", { label })).data;
}
export async function rotateApiKey(): Promise<CreateApiKeyResponse> {
    return (await api.post<CreateApiKeyResponse>("/portal/api-keys/rotate")).data;
}
export async function revokeApiKey(id: string): Promise<void> {
    await api.delete(`/portal/api-keys/${id}`);
}

export async function listPortalTasks(params: GetTasksParams): Promise<PortalTasksResponse> {
    return (await api.get<PortalTasksResponse>("/portal/tasks", { params })).data;
}
export async function getPortalTask(id: string): Promise<PortalTask> {
    return (await api.get<PortalTask>(`/portal/tasks/${id}`)).data;
}
export async function cancelPortalTask(id: string): Promise<PortalTask> {
    return (await api.post<PortalTask>(`/portal/tasks/${id}/cancel`)).data;
}

export async function ledger(cursor?: string, limit = 20): Promise<PortalLedgerResponse> {
    return (await api.get<PortalLedgerResponse>("/portal/ledger", { params: { cursor, limit } })).data;
}

export async function pricing(): Promise<PortalPricingResponse> {
    return (await api.get<PortalPricingResponse>("/portal/pricing")).data;
}

export async function deleteImage(id: string): Promise<void> {
    await api.delete(`/v1/images/${encodeURIComponent(id)}`);
}

/** Nhóm theo miền cho trang/feature gọi gọn: `portalApi.auth.login(...)`. */
export const portalApi = {
    auth: {
        login,
        register,
        logout,
        me,
        verifyEmail: (token: string) => verifyEmail({ token }),
        resendVerification: (email: string) => resendVerification({ email }),
        forgotPassword: (email: string) => forgotPassword({ email }),
        resetPassword: (token: string, newPassword: string) => resetPassword({ token, newPassword }),
        googleStartUrl,
    },
    apiKeys: {
        list: listApiKeys,
        create: (label: string) => createApiKey(label),
        rotate: rotateApiKey,
        revoke: revokeApiKey,
    },
    tasks: {
        list: listPortalTasks,
        get: getPortalTask,
        cancel: cancelPortalTask,
    },
    ledger,
    pricing,
};
