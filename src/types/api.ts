export interface ApiErrorDetail {
    path: string;
    message: string;
}

export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        requestId: string;
        details?: ApiErrorDetail[];
    };
}


export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    ok: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface RegisterResponse {
    ok: boolean;
    email: string;
    devToken: string | null;
}

export interface ResendVerificationEmailRequest {
    email: string;
}

export interface ResendVerificationEmailResponse {
    ok: boolean;
}


export type UserStatus =
    | "active"
    | "suspended";

export interface PortalUser {
    id: string;
    email: string;
    name: string;

    planId: string;

    planExpiresAt: string | null;

    status: UserStatus;

    credits: number;

    emailVerified: boolean;

    maxConcurrentOverride: number | null;
    maxPendingOverride: number | null;
    fairUsePerDayOverride: number | null;

    createdAt: string;
}


export interface PortalPlan {
    name: string;

    maxConcurrent: number;
    maxPending: number;

    ratePerSec: number;
    statusRatePerSec: number;

    chargesCredits: boolean;

    monthlyCredits: number;

    fairUsePerDay: number | null;

    active: boolean;

    id: string;
}


export interface ApiKey {
    id: string;
    userId: string;

    label: string;
    last4: string;

    revokedAt: string | null;
    lastUsedAt: string | null;

    createdAt: string;
}

export interface ApiKeysResponse {
    items: ApiKey[];
}

export interface CreateApiKeyRequest {
    label: string;
}

export interface CreateApiKeyResponse {
    id: string;
    raw: string;
    last4: string;
    label: string;
}



export interface PortalBalance {
    raw: number;
    display: string;
}


export interface PortalUsage {
    today: number;
    last7Days: number;

    creditsSpentToday: number;
    creditsSpent7d: number;

    activeTasks: number;
}


export interface PortalMeResponse {
    user: PortalUser;

    plan: PortalPlan | null;

    keys: ApiKey[];

    balance: PortalBalance;

    usage: PortalUsage;
}


export type TaskStatus =
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled";

export type TaskStage =
    | "generate"
    | "upscale";

export interface TaskBaseResult {
    mediaId: string;
    url: string | null;
}

export interface TaskUpscaleResult {
    status: "done" | "failed";
    code?: string;
    message?: string;
}

export interface TaskResult {
    mediaId: string;
    url: string | null;

    mock?: boolean;

    resolution?: string;

    base?: TaskBaseResult;

    upscale?: TaskUpscaleResult;
}

export interface TaskError {
    code: string;
    message: string;
}

export interface PortalTask {
    id: string;
    batchId: string;

    status: TaskStatus;

    stage: TaskStage;

    worker: string;

    model: string | null;

    priceCredits: number;

    result: TaskResult | null;

    error: TaskError | null;

    creditsRefunded: number;

    createdAt: string;
    updatedAt: string;

    completedAt: string | null;
}

export interface PortalTasksResponse {
    tasks: PortalTask[];

    nextCursor: string | null;
}

export interface GetTasksParams {
    status?: TaskStatus;
    cursor?: string;
    limit?: number;
}


export type TaskWorker =
    | "text-to-video"
    | "image-to-video"
    | "reference-images-to-video"
    | "start-end-image-to-video"
    | "extend-video"
    | "text-to-image"
    | "image-to-image";

export type UpscaleResolution =
    | "2K"
    | "4K"
    | "1080P";

export interface CreateTaskImages {
    start?: string;
    end?: string;
    references?: string[];
    source?: string;
}

export interface CreateTaskUpscale {
    resolution: UpscaleResolution;
}

export interface CreateTaskItem {
    worker: TaskWorker;

    params: Record<string, unknown>;

    images?: CreateTaskImages;

    sourceMediaId?: string;

    upscale?: CreateTaskUpscale;
}

export interface CreateTasksRequest {
    tasks: CreateTaskItem[];

    webhookUrl?: string;
}

export interface CreateTasksResponse {
    batchId: string;

    totalCredits: number;

    tasks: PortalTask[];
}
export interface BatchTasksResponse {
    tasks: PortalTask[];
}

export interface UploadedImage {
    imageId: string;
    mime: string;
    size: number;
    sha256: string;
    createdAt: string;
    expiresAt: string;
}

export interface UploadImagesResponse {
    images: UploadedImage[];
}

export interface PricingWorker {
    credits: number | null;

    models: Record<string, number>;
}

export interface PortalPricingResponse {
    workers: Record<
        string,
        PricingWorker
    >;
}


export interface LedgerItem {
    id: string;
    kind: string;

    delta: number;
    balanceAfter: number;

    taskId: string | null;
    refId: string | null;

    note: string | null;

    createdAt: string;
}

export interface PortalLedgerResponse {
    items: LedgerItem[];

    nextCursor: string | null;

    balance: number;
}


export interface PaymentBankInfo {
    bank: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
}

export interface PaymentPackage {
    id: string;
    label: string;
    amountVnd: number;
    credits: number;
}

export interface PaymentPackagesResponse {
    enabled: boolean;

    bankInfo: PaymentBankInfo;

    transferCodePrefix: string;

    packages: PaymentPackage[];
}


export type PaymentStatus =
    | "pending"
    | "paid"
    | "cancelled"
    | "failed";

export interface PaymentIntent {
    intentId: string;

    code: string;

    qrImageUrl: string;

    isExisting: boolean;

    status: PaymentStatus;

    expired: boolean;

    package: PaymentPackage;

    bankInfo: PaymentBankInfo;

    failureReason: string | null;

    cancellationReason: string | null;

    paidAt: string | null;

    expiresAt: string;

    createdAt: string;
}

export interface CreatePaymentIntentRequest {
    packageId: string;
}


export interface PaymentIntentListResponse {
    items: PaymentIntent[];
    nextCursor: string | null;
}


export interface DashboardData {
    me: PortalMeResponse;

    tasks: PortalTasksResponse;

    pricing: PortalPricingResponse;
}

