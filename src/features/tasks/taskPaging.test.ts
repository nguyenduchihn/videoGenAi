import { describe, expect, it } from "vitest";
import { emptyTrail, nextPageState, prevPageState, readPageState, rememberCursor, withPageState } from "./taskPaging";

describe("taskPaging — phân trang theo cursor cho lịch sử tác vụ", () => {
    it("đọc URL: không cursor ⇒ trang 1; có cursor ⇒ ít nhất trang 2", () => {
        expect(readPageState(new URLSearchParams(""))).toEqual({ page: 1 });
        expect(readPageState(new URLSearchParams("page=3&cursor=c3"))).toEqual({ page: 3, cursor: "c3" });
        expect(readPageState(new URLSearchParams("cursor=c"))).toEqual({ page: 2, cursor: "c" });
        expect(readPageState(new URLSearchParams("page=abc"))).toEqual({ page: 1 });
    });

    it("đi tới rồi quay lại theo vết; mất vết ⇒ về trang 1", () => {
        let trail = emptyTrail();
        const p2 = nextPageState({ page: 1 }, "c2");
        trail = rememberCursor(trail, p2);
        const p3 = nextPageState(p2, "c3");
        trail = rememberCursor(trail, p3);
        expect(p3).toEqual({ page: 3, cursor: "c3" });
        expect(prevPageState(p3, trail)).toEqual({ page: 2, cursor: "c2" });
        expect(prevPageState(p2, trail)).toEqual({ page: 1 });
        expect(prevPageState({ page: 5, cursor: "c5" }, emptyTrail())).toEqual({ page: 1 }); // vừa tải lại, không biết cursor trang 4
    });

    it("rememberCursor không tạo Map mới khi không đổi", () => {
        const trail = rememberCursor(emptyTrail(), { page: 2, cursor: "c2" });
        expect(rememberCursor(trail, { page: 2, cursor: "c2" })).toBe(trail);
        expect(rememberCursor(trail, { page: 2, cursor: "c2b" })).not.toBe(trail);
    });

    it("withPageState giữ các tham số khác, xoá page/cursor khi về trang 1", () => {
        const base = new URLSearchParams("status=failed&id=t1");
        const p2 = withPageState(base, { page: 2, cursor: "c2" });
        expect(p2.toString()).toBe("status=failed&id=t1&page=2&cursor=c2");
        expect(withPageState(p2, { page: 1 }).toString()).toBe("status=failed&id=t1");
        expect(base.has("page")).toBe(false); // không sửa params gốc
    });
});
