import { toApiError } from "@/lib/errors";
import { toLabel } from "./modelCatalog";
import { useAuthStore } from "@/stores/auth.store";

/** Mô hình bán hàng hiện tại (đọc store, không cần hook) để copy lỗi gợi đúng hành động: nạp credit hay gia hạn gói. */
const commercialMode = () => useAuthStore.getState().user?.commercialMode ?? "payg";

type Metadata = Record<string, unknown>;

const text = (metadata: Metadata, key: string): string | undefined => {
    const value = metadata[key];
    return typeof value === "string" && value ? value : undefined;
};
const num = (metadata: Metadata, key: string): number | undefined => {
    const value = metadata[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const ROLE_LABELS: Record<string, string> = {
    "images.start": "Khung đầu",
    "images.end": "Khung cuối",
    "images.references": "ảnh tham chiếu",
    "images.source": "ảnh nguồn",
    "images.sources": "ảnh nguồn",
};
const roleLabel = (field: string | undefined): string => (field ? ROLE_LABELS[field] ?? field : "ảnh đính kèm");

const QUEUE_FULL_RETRY = (seconds: number) => `Hàng đợi đang đầy, tự gửi lại sau ${seconds}s.`;
export const QUEUE_FULL_GIVE_UP = "Hệ thống đang quá tải, vui lòng thử lại sau.";

function describeBadImageInputs(message: string | undefined, metadata: Metadata): string {
    const field = text(metadata, "field");
    const handle = text(metadata, "handle") ?? "?";
    switch (text(metadata, "constraint")) {
        case "required":
            return `Thiếu ảnh cho ${roleLabel(field)}.`;
        case "maxCount": {
            const model = text(metadata, "model");
            const base = `Model ${model ? toLabel(model) : "này"} chỉ nhận tối đa ${num(metadata, "max") ?? "?"} ảnh (đang gửi ${num(metadata, "given") ?? "?"}).`;
            const omniMax = num(metadata, "omniMax");
            return omniMax !== undefined && model !== "Veo_3.1-Omni" ? `${base} Omni nhận tới ${omniMax}.` : base;
        }
        case "roleNotAllowed":
            return `Chế độ này không dùng ${roleLabel(field)}.`;
        case "exclusive":
            return "Chỉ chọn một trong hai: ảnh nguồn đơn hoặc danh sách ảnh nguồn.";
        case "handleFormat":
            return `Tên ảnh @${handle} không hợp lệ: chữ thường, số, _ hoặc -, bắt đầu bằng chữ, tối đa 30 ký tự.`;
        case "handleUnique":
            return `Tên ảnh @${handle} bị trùng.`;
        case "mentionUnbound":
            return `Prompt nhắc @${handle} nhưng chưa có ảnh nào đặt tên @${handle}.`;
        default:
            return message ?? "Ảnh đính kèm không hợp lệ.";
    }
}

/** Copy tiếng Việt cho mã lỗi backend (lúc tạo task lẫn `task.error`), ưu tiên `error.metadata`. */
export function describeTaskError(code?: string, message?: string, metadata: Metadata = {}): string {
    switch (code) {
        case "BAD_IMAGE_INPUTS":
            return describeBadImageInputs(message, metadata);
        case "IMAGE_NOT_FOUND": {
            const ttl = num(metadata, "ttlHours");
            return `Ảnh đính kèm đã hết hạn${ttl ? ` (${ttl} giờ)` : ""} hoặc không còn trên máy chủ. Chọn lại ảnh rồi tạo lại.`;
        }
        case "IMAGE_UPLOAD_FAILED":
            return "Không đưa được ảnh lên Google sau nhiều lần thử. Credit đã hoàn. Thử ảnh khác hoặc tạo lại.";
        case "BAD_UPSCALE":
            return "Độ phân giải upscale không hợp lệ với chế độ này.";
        case "SOURCE_MEDIA_NOT_FOUND":
            return "Không tìm thấy video gốc hoặc video chưa hoàn thành. Chọn video khác.";
        case "QUEUE_FULL":
        case "RATE_LIMITED": {
            const seconds = num(metadata, "retryAfterSec");
            return seconds !== undefined ? QUEUE_FULL_RETRY(seconds) : QUEUE_FULL_GIVE_UP;
        }
        case "INSUFFICIENT_CREDITS": {
            const need = num(metadata, "required");
            const have = num(metadata, "balance");
            const detail = need !== undefined && have !== undefined ? ` (cần ${need}, còn ${have})` : "";
            return commercialMode() === "subscription"
                ? `Credit theo gói đã hết${detail}. Gia hạn gói để nhận credit mới.`
                : `Không đủ credit${detail}. Nạp thêm để tiếp tục.`;
        }
        case "PLAN_EXPIRED":
            return commercialMode() === "subscription"
                ? "Gói dịch vụ của bạn đã hết hạn. Gia hạn trong mục Gói của tôi để tiếp tục tạo."
                : "Tài khoản của bạn đang bị giới hạn. Vui lòng liên hệ hỗ trợ.";
        case "FAIR_USE": {
            const limit = num(metadata, "limit");
            return `Bạn đã dùng hết lượt tạo video hôm nay${limit !== undefined ? ` (${limit.toLocaleString("vi-VN")} video/ngày của gói)` : ""}. Tiếp tục vào ngày mai hoặc nâng cấp gói.`;
        }
        case "MODE_MISMATCH":
            return "Hệ thống vừa đổi mô hình bán hàng. Tải lại trang để tiếp tục.";
        case "VALIDATION_FAILED":
            return message ?? "Dữ liệu tạo không hợp lệ.";
        case "UNUSUAL_ACTIVITY":
            return "Hệ thống AI đang tạm thời từ chối yêu cầu do kiểm tra bảo mật. Credit đã được hoàn lại. Vui lòng thử lại sau.";
        case "API_ERROR":
            return "Dịch vụ AI gặp lỗi khi xử lý yêu cầu. Credit đã được hoàn lại.";
        case "TASK_TIMEOUT":
            return "Google không trả kết quả trong 2 giờ. Credit đã được hoàn lại.";
        case "CANCELLED":
            return "Đã hủy tạo. Credit đã được hoàn lại.";
        case "NETWORK":
            return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
        default:
            return message || "Tác vụ không thể hoàn thành.";
    }
}

export const queueFullMessage = QUEUE_FULL_RETRY;

/** Lỗi ném ra từ axios/ApiError/GeneratorError ⇒ câu tiếng Việt. */
export function describeApiError(error: unknown): string {
    const apiError = toApiError(error);
    if (apiError.status === 429) {
        return apiError.retryAfterSec !== undefined ? QUEUE_FULL_RETRY(apiError.retryAfterSec) : QUEUE_FULL_GIVE_UP;
    }
    return describeTaskError(apiError.code, apiError.message, apiError.metadata);
}
