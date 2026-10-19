import { describe, expect, it } from "vitest";
import { frameAt, planFrameJobs } from "./frameJobs";

describe("planFrameJobs — nhiều ảnh khung ⇒ mỗi ảnh một video", () => {
    it("1 ảnh: giữ nguyên danh sách prompt (hành vi cũ)", () => {
        expect(planFrameJobs("image-to-video", ["a", "b"], 1, 0)).toEqual({ frames: 1, jobs: ["a", "b"], promptMismatch: false });
    });

    it("N ảnh + 1 prompt ⇒ prompt dùng chung, N job", () => {
        expect(planFrameJobs("image-to-video", ["chung"], 3, 0)).toEqual({ frames: 3, jobs: ["chung", "chung", "chung"], promptMismatch: false });
    });

    it("N ảnh + N prompt ⇒ ghép theo thứ tự; số prompt lệch ⇒ promptMismatch", () => {
        expect(planFrameJobs("image-to-video", ["a", "b"], 2, 0)).toMatchObject({ jobs: ["a", "b"], promptMismatch: false });
        expect(planFrameJobs("image-to-video", ["a", "b"], 3, 0).promptMismatch).toBe(true);
    });

    it("khung đầu + cuối: số video = max(đầu, cuối); chế độ khác không nhân bản", () => {
        expect(planFrameJobs("start-end-image-to-video", ["p"], 1, 4).frames).toBe(4);
        expect(planFrameJobs("image-to-video", ["p"], 1, 4).frames).toBe(1);
        expect(planFrameJobs("text-to-video", ["p"], 5, 5)).toEqual({ frames: 0, jobs: ["p"], promptMismatch: false });
    });

    it("chưa nhập prompt ⇒ không sinh job", () => {
        expect(planFrameJobs("image-to-video", [], 3, 0).jobs).toEqual([]);
    });
});

describe("frameAt", () => {
    it("một ảnh dùng chung; nhiều ảnh lấy đúng số thứ tự; thiếu ⇒ undefined", () => {
        expect(frameAt(["x"], 5)).toBe("x");
        expect(frameAt(["a", "b", "c"], 1)).toBe("b");
        expect(frameAt(["a", "b"], 2)).toBeUndefined();
        expect(frameAt([], 0)).toBeUndefined();
    });
});
