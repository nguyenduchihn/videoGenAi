import { describe, expect, it } from "vitest";

import { formatCredits, formatDate, formatRelativeTime, formatVnd } from "./format";

describe("format", () => {
    it("formatCredits/formatVnd dùng dấu chấm ngăn nghìn kiểu vi-VN", () => {
        expect(formatCredits(1240)).toBe("1.240 Credits");
        expect(formatVnd(199000)).toBe("199.000 ₫");
    });

    it("formatDate trả dd/MM/yyyy", () => {
        expect(formatDate("2026-09-01T08:00:00.000Z")).toMatch(/^0?1\/0?9\/2026$/);
    });

    it("formatRelativeTime theo mốc phút/giờ/ngày", () => {
        const now = Date.now();
        expect(formatRelativeTime(new Date(now - 30_000).toISOString())).toBe("vừa xong");
        expect(formatRelativeTime(new Date(now - 5 * 60_000).toISOString())).toBe("5 phút trước");
        expect(formatRelativeTime(new Date(now - 3 * 3_600_000).toISOString())).toBe("3 giờ trước");
        expect(formatRelativeTime(new Date(now - 2 * 86_400_000).toISOString())).toBe("2 ngày trước");
    });
});
