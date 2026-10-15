import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/errors";
import { describeApiError, describeTaskError } from "./errorCopy";

describe("describeTaskError", () => {
    it("BAD_IMAGE_INPUTS maxCount names model, max, given and the Omni hint", () => {
        const copy = describeTaskError("BAD_IMAGE_INPUTS", "raw", {
            field: "images.references", constraint: "maxCount", max: 3, given: 5, model: "Veo_3.1-Lite", omniMax: 7,
        });
        expect(copy).toBe("Model Veo 3.1 Lite chỉ nhận tối đa 3 ảnh (đang gửi 5). Omni nhận tới 7.");
    });

    it("BAD_IMAGE_INPUTS required/roleNotAllowed/handle constraints use role labels", () => {
        expect(describeTaskError("BAD_IMAGE_INPUTS", "", { field: "images.start", constraint: "required" })).toBe("Thiếu ảnh cho Khung đầu.");
        expect(describeTaskError("BAD_IMAGE_INPUTS", "", { field: "images.sources", constraint: "roleNotAllowed" })).toBe("Chế độ này không dùng ảnh nguồn.");
        expect(describeTaskError("BAD_IMAGE_INPUTS", "", { constraint: "mentionUnbound", handle: "girl" })).toBe("Prompt nhắc @girl nhưng chưa có ảnh nào đặt tên @girl.");
        expect(describeTaskError("BAD_IMAGE_INPUTS", "server text", {})).toBe("server text");
    });

    it("IMAGE_NOT_FOUND mentions the TTL when given", () => {
        expect(describeTaskError("IMAGE_NOT_FOUND", "", { imageId: "x", ttlHours: 24 })).toContain("24 giờ");
    });

    it("INSUFFICIENT_CREDITS uses required/balance when present", () => {
        expect(describeTaskError("INSUFFICIENT_CREDITS", "", { required: 50, balance: 10 })).toBe("Không đủ credit (cần 50, còn 10). Nạp thêm để tiếp tục.");
        expect(describeTaskError("INSUFFICIENT_CREDITS")).toContain("Không đủ credit");
    });

    it("falls back to the server message, then a generic sentence", () => {
        expect(describeTaskError("SOMETHING_NEW", "server said")).toBe("server said");
        expect(describeTaskError(undefined, undefined)).toBe("Tác vụ không thể hoàn thành.");
    });
});

describe("describeApiError", () => {
    it("429 shows the Retry-After countdown copy", () => {
        const err = new ApiError(429, "QUEUE_FULL", "full", "r1", { retryAfterSec: 7 });
        expect(describeApiError(err)).toBe("Hàng đợi đang đầy, tự gửi lại sau 7s.");
        expect(describeApiError(new ApiError(429, "QUEUE_FULL", "full"))).toBe("Hệ thống đang quá tải, vui lòng thử lại sau.");
    });

    it("uses error.metadata from the ApiError", () => {
        const err = new ApiError(400, "BAD_IMAGE_INPUTS", "raw", "r1", { metadata: { field: "images.end", constraint: "required" } });
        expect(describeApiError(err)).toBe("Thiếu ảnh cho Khung cuối.");
    });

    it("plain Error falls back to its message", () => {
        expect(describeApiError(new Error("boom"))).toBe("boom");
    });
});
