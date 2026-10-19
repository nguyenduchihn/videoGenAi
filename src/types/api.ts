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
        /** Ngữ cảnh lỗi có cấu trúc (BAD_IMAGE_INPUTS: field/constraint/max/given/model/omniMax/handle; IMAGE_NOT_FOUND: imageId/ttlHours). */
        metadata?: Record<string, unknown>;
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


/** Mô hình bán hàng: payg = nạp credit theo lượt (mặc định); subscription = bán gói dịch vụ, nạp credit tắt. */
export type CommercialMode = "payg" | "subscription";

export interface PortalPlan {
    name: string;
    /** Bán gói (subscription): giá mỗi kỳ (VND, 0 = không bán công khai), kỳ hạn, mô tả, thứ tự. */
    priceVnd: number;
    periodDays: number;
    description: string | null;
    sortOrder: number;

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
    /** Job video trả phí tạo hôm nay — so với plan.fairUsePerDay của gói không trừ credit. */
    fairUseToday: number;
}


export interface PortalMeResponse {
    user: PortalUser;

    plan: PortalPlan | null;

    keys: ApiKey[];

    balance: PortalBalance;

    usage: PortalUsage;

    commercialMode: CommercialMode;
    /** subscription: số ngày dùng thử gói mặc định cho khách mới (0 = không hạn). */
    trialDays: number;
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

    generationMode?: "mock" | "real";

    /** Lượt tạo (portal); null = tạo ngoài lượt / task cũ. */
    runId: string | null;
    runIndex: number | null;
    /** params.prompt cắt 500 ký tự — để hiển thị. */
    prompt: string | null;
}

export interface PortalTasksResponse {
    tasks: PortalTask[];

    nextCursor: string | null;
}

/** GET /v1/tasks?ids=… */
export interface ListTasksByIdsResponse {
    tasks: PortalTask[];
    notFound: string[];
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

/** Ảnh đính kèm: imageId trần hoặc kèm `handle` để nhắc `@handle` trong prompt. */
export type ImageRef = string | { imageId: string; handle?: string };


export interface CreateTaskImages {
    start?: ImageRef[];
    end?: ImageRef[];
    references?: ImageRef[];
    source?: ImageRef;
    sources?: ImageRef[];
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

    /** Lượt tạo: task i nhận runIndex = runOffset + i; trùng ⇒ 409 RUN_INDEX_TAKEN (không tạo gì). */
    runId?: string;
    runOffset?: number;
}

export interface CreateTasksResponse {
    batchId: string;

    totalCredits: number;

    tasks: PortalTask[];
}
export interface BatchTasksResponse {
    tasks: PortalTask[];
}

/** POST /v1/batches/:id/cancel — `cancelled` là các task vừa huỷ; `skipped` = task đã kết thúc, không huỷ được. */
export interface CancelBatchResponse {
    cancelled: PortalTask[];
    skipped: number;
    creditsRefunded: number;
}

export interface UploadedImage {
    imageId: string;
    /** Tên field multipart khách đặt (vd `references_001`) — trả lại để ghép id vào đúng vai trò. */
    name: string;
    filename: string | null;
    /** Trùng nội dung ảnh đã có ⇒ id ảnh gốc (cùng imageId); null = ảnh mới. */
    duplicateOf: string | null;
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
    /** false ⇒ nạp tiền tạm tắt (vẫn hiện gói để khách xem giá). */
    topupEnabled: boolean;
    /** Gói nạp công khai (không kèm thông tin ngân hàng); [] ở chế độ subscription. */
    packages: PaymentPackage[];
    commercialMode: CommercialMode;
    /** Gói dịch vụ đang mở bán (chỉ subscription), đã sắp theo thứ tự hiển thị. */
    plans: PricingPlan[];
    /** Credit tặng khi đăng ký (cấu hình admin) — landing hiện "Tặng N credit". */
    signupGrant: number;
    /** subscription: số ngày dùng thử gói mặc định cho khách mới; 0 = không hạn. */
    trialDays: number;
    /** Số task tối đa trong một lần POST /v1/tasks. */
    maxBatchTasks: number;
}

export interface PricingPlan {
    id: string;
    name: string;
    description: string | null;
    priceVnd: number;
    periodDays: number;
    maxConcurrent: number;
    maxPending: number;
    chargesCredits: boolean;
    monthlyCredits: number;
    fairUsePerDay: number | null;
    allowRealMode: boolean;
}


export interface LedgerItem {
    id: string;
    kind: string;

    delta: number;
    balanceAfter: number | null;

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

/** topup = nạp credit; plan_purchase = mua / gia hạn gói dịch vụ (package = gói dịch vụ, credits = credit cấp ngay). */
export type PaymentIntentKind = "topup" | "plan_purchase";

export interface PaymentIntent {
    intentId: string;

    code: string;

    qrImageUrl: string;

    isExisting: boolean;

    kind: PaymentIntentKind;
    planId: string | null;
    periodDays: number | null;

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

export interface CreatePlanIntentRequest {
    planId: string;
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

export interface ForgotPasswordRequest { email: string }
export interface ForgotPasswordResponse { ok: boolean; devToken?: string | null }

export interface ResetPasswordRequest { token: string; newPassword: string }
export interface ResetPasswordResponse { ok: boolean; email: string }

export interface ResendVerificationRequest { email: string }
export interface ResendVerificationResponse { ok: boolean; devToken?: string | null }

export interface VerifyEmailRequest { token: string }
export interface VerifyEmailResponse {
    ok: boolean;
    user: PortalUser;
    firstKey: {
        id: string;
        raw: string;
        last4: string;
        label: string;
    } | null;
}

export interface V1Me {
    userId: string;
    credits: number;
    status: UserStatus;
    emailVerified: boolean;
    planExpiresAt: string | null;
    commercialMode: CommercialMode;
    plan: {
        id: string;
        name: string;
        maxConcurrent: number;
        maxPending: number;
        chargesCredits: boolean;
    };
}

// ── Lượt tạo (/v1/runs) ──
export type RunStatus = "active" | "done" | "cancelled";
export type RunPausedReason = "INSUFFICIENT_CREDITS";

export interface RunCounts {
    pending: number;
    processing: number;
    succeeded: number;
    failed: number;
    cancelled: number;
}

export interface RunSummary {
    id: string;
    name: string | null;
    totalPlanned: number;
    /** Số task đã tạo (= tổng counts). */
    created: number;
    /** Job còn xếp hàng trên máy chủ, chưa thành task. */
    queuedOnServer: number;
    counts: RunCounts;
    /** Task failed đã được thử lại (không còn là lỗi mở). */
    retried: number;
    status: RunStatus;
    pausedReason: RunPausedReason | null;
    etaSec: number | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
}

export interface RunsPage {
    runs: RunSummary[];
    nextCursor: string | null;
}

export interface RunTasksPage {
    tasks: PortalTask[];
    /** runIndex cuối trang (chuỗi) — truyền vào `cursor`. */
    nextCursor: string | null;
}

export interface CancelRunResponse {
    run: RunSummary;
    cancelled: number;
    queuedCancelled: number;
    creditsRefunded: number;
}

export interface EnqueueRunItemsResponse {
    added: number;
    duplicates: number[];
    run: RunSummary;
}

export interface V1ModelEntry {
    model: string;
    family: string;
    default: boolean;
    credits: number | null;
    note?: string;
}

export interface V1Models {
    video: V1ModelEntry[];
    image: V1ModelEntry[];
}
