import { describe, expect, it } from "vitest";
import { acquireMediaSlot, MEDIA_CONCURRENCY, mediaQueueState } from "./mediaQueue";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("mediaQueue — tối đa 4 media tải cùng lúc, FIFO", () => {
    it("cấp ngay 4 slot đầu, slot 5 đợi tới khi một slot được trả", async () => {
        const order: number[] = [];
        const releases: Array<() => void> = [];
        const pending = Array.from({ length: MEDIA_CONCURRENCY + 1 }, (_, i) =>
            acquireMediaSlot().then((release) => { order.push(i); releases.push(release); }),
        );
        await tick();
        expect(order).toEqual([0, 1, 2, 3]);
        expect(mediaQueueState()).toEqual({ active: 4, waiting: 1 });
        releases[0]!();
        releases[0]!(); // gọi lại vô hại
        await tick();
        expect(order).toEqual([0, 1, 2, 3, 4]);
        expect(mediaQueueState().active).toBe(4);
        releases.forEach((r) => r());
        await Promise.all(pending);
        expect(mediaQueueState()).toEqual({ active: 0, waiting: 0 });
    });

    it("thẻ huỷ khi còn xếp hàng bị bỏ qua, slot chuyển cho thẻ sau", async () => {
        const releases: Array<() => void> = [];
        for (let i = 0; i < MEDIA_CONCURRENCY; i += 1) releases.push(await acquireMediaSlot());
        const cancelled = new AbortController();
        let cancelledGot = false;
        void acquireMediaSlot(cancelled.signal).then(() => { cancelledGot = true; });
        let laterGot = false;
        void acquireMediaSlot().then((r) => { laterGot = true; r(); });
        cancelled.abort();
        releases[0]!();
        await tick();
        expect(cancelledGot).toBe(false);
        expect(laterGot).toBe(true);
        releases.slice(1).forEach((r) => r());
        await tick();
        expect(mediaQueueState()).toEqual({ active: 0, waiting: 0 });
    });
});
