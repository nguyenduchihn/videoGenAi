import type { AxiosError } from "axios";

export interface ApiErrorExtra {
    /** `error.metadata` của backend (BAD_IMAGE_INPUTS, IMAGE_NOT_FOUND…). */
    metadata?: Record<string, unknown>;
    /** Header `Retry-After` (giây) khi 429 QUEUE_FULL / RATE_LIMITED. */
    retryAfterSec?: number;
}

export class ApiError extends Error {
    status: number;
    code: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
    retryAfterSec?: number;
    constructor(status: number, code: string, message: string, requestId?: string, extra: ApiErrorExtra = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.requestId = requestId;
        this.metadata = extra.metadata;
        this.retryAfterSec = extra.retryAfterSec;
    }
}

type ApiErrorBody = { error?: { code?: string; message?: string; requestId?: string; metadata?: Record<string, unknown> } };

function parseRetryAfter(value: unknown): number | undefined {
    if (typeof value !== "string" && typeof value !== "number") return undefined;
    const seconds = Number.parseInt(String(value), 10);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

export function toApiError(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    const ax = err as AxiosError<ApiErrorBody>;
    if (ax?.isAxiosError) {
        if (!ax.response) return new ApiError(0, "NETWORK", "Lỗi kết nối mạng.");
        const e = ax.response.data?.error;
        const headers = ax.response.headers as Record<string, unknown> | undefined;
        return new ApiError(ax.response.status, e?.code ?? String(ax.response.status), e?.message ?? ax.message, e?.requestId, {
            metadata: e?.metadata,
            retryAfterSec: parseRetryAfter(headers?.["retry-after"]),
        });
    }
    return new ApiError(0, "INTERNAL", err instanceof Error ? err.message : "Lỗi không xác định.");
}

const MSGS: Record<string, string> = {
    INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
    EMAIL_NOT_VERIFIED: "Email chưa được xác minh. Kiểm tra hộp thư để xác nhận.",
    USER_SUSPENDED: "Tài khoản đã bị tạm khóa. Liên hệ hỗ trợ.",
    EMAIL_TAKEN: "Email này đã được đăng ký.",
    WEAK_PASSWORD: "Mật khẩu quá yếu. Dùng ít nhất 8 ký tự.",
    TOKEN_INVALID: "Liên kết không hợp lệ.",
    TOKEN_EXPIRED: "Liên kết đã hết hạn. Vui lòng yêu cầu gửi lại.",
    TOKEN_USED: "Liên kết đã được sử dụng.",
    SESSION_REQUIRED: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    UNAUTHENTICATED: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    PLAN_EXPIRED: "Gói dịch vụ đã hết hạn.",
    FAIR_USE: "Đã dùng hết lượt tạo video hôm nay của gói.",
    MODE_MISMATCH: "Hệ thống vừa đổi mô hình bán hàng. Tải lại trang để tiếp tục.",
    PLAN_NOT_FOR_SALE: "Gói này hiện không mở bán.",
    INSUFFICIENT_CREDITS: "Không đủ credit để thực hiện tác vụ.",
    SEAPAY_DISABLED: "Nạp Credits tạm thời chưa khả dụng.",
    PACKAGE_NOT_FOUND: "Gói không tồn tại.",
    INTENT_NOT_FOUND: "Lệnh thanh toán không tồn tại.",
    INTENT_NOT_PENDING: "Lệnh thanh toán không ở trạng thái chờ.",
    INTENT_ALREADY_PAID: "Lệnh thanh toán đã được thanh toán.",
    OAUTH_NOT_CONFIGURED: "Đăng nhập Google chưa được cấu hình.",
    API_KEY_NOT_FOUND: "API key không tồn tại.",
    NETWORK: "Lỗi kết nối mạng. Vui lòng kiểm tra internet.",
};

export function getErrorMessage(err: unknown): string {
    const ae = toApiError(err);
    if (ae.status === 429) return "Bạn đang thao tác quá nhanh. Vui lòng chờ một lúc.";
    return MSGS[ae.code] ?? ae.message;
}
