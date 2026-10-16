import { describe, expect, it } from "vitest";
import type { RunSummary } from "@/types/api";
import { formatEta, pollIntervalFor, runAutoName, runPercent, runStateLabel } from "./runCopy";

const run = (over: Partial<RunSummary> = {}): RunSummary => ({
    id: "11111111-2222-4333-8444-555555555555", name: null, totalPlanned: 10, created: 10, queuedOnServer: 0, retried: 0,
    counts: { pending: 0, processing: 0, succeeded: 8, failed: 2, cancelled: 0 }, status: "done", pausedReason: null, etaSec: null,
    cancelledAt: null, createdAt: "", updatedAt: "", lastActivityAt: "", ...over,
});

describe("runCopy", () => {
    it("runPercent counts finished jobs over the planned total (queued/unsent count as not done)", () => {
        expect(runPercent(run())).toBe(100);
        expect(runPercent(run({ totalPlanned: 40, queuedOnServer: 30 }))).toBe(25);
        expect(runPercent(run({ counts: { pending: 5, processing: 5, succeeded: 0, failed: 0, cancelled: 0 } }))).toBe(0);
    });

    it("runStateLabel reflects pause, local remainder, server queue and completion", () => {
        expect(runStateLabel(run({ status: "active", pausedReason: "INSUFFICIENT_CREDITS" }))).toBe("Tạm dừng: thiếu credit");
        expect(runStateLabel(run({ status: "active" }), 12)).toBe("Còn 12 job chờ gửi");
        expect(runStateLabel(run({ status: "active", queuedOnServer: 30 }))).toBe("Đang xếp hàng trên máy chủ (30 job)");
        expect(runStateLabel(run({ status: "active" }))).toBe("Đang chạy");
        expect(runStateLabel(run())).toBe("Hoàn tất");
        expect(runStateLabel(run({ counts: { pending: 0, processing: 0, succeeded: 0, failed: 3, cancelled: 0 } }))).toBe("Thất bại");
        expect(runStateLabel(run({ status: "cancelled" }))).toBe("Đã huỷ");
    });

    it("formatEta and pollIntervalFor scale with size", () => {
        expect(formatEta(null)).toBe("Đang ước tính…");
        expect(formatEta(30)).toBe("Ước tính còn dưới 1 phút");
        expect(formatEta(900)).toBe("Ước tính còn ~15 phút");
        expect(formatEta(5_400)).toBe("Ước tính còn ~1 giờ 30 phút");
        expect([pollIntervalFor(5), pollIntervalFor(100), pollIntervalFor(900)]).toEqual([3_000, 10_000, 20_000]);
    });

    it("runAutoName trims the first prompt and appends count + timestamp", () => {
        const name = runAutoName("Một chú mèo đang lướt sóng   lúc hoàng hôn trên biển xanh", 50, new Date(2026, 9, 15, 14, 32));
        expect(name).toMatch(/^Một chú mèo đang lướt sóng lúc hoàng.*… · 50 job · /);
        expect(name).not.toContain("  ");
        expect(runAutoName("   ", 1, new Date(2026, 9, 15, 14, 32))).toMatch(/^Lượt tạo · 1 job · /);
    });
});
