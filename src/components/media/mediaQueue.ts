/**
 * Hàng đợi tải media: tối đa MEDIA_CONCURRENCY ảnh/video tải cùng lúc, theo thứ tự xin slot (= thứ tự trong DOM, từ trên xuống).
 * Không có nó, 20 thẻ vào khung cùng lúc ⇒ 20 file lớn tranh băng thông, hàng đầu cũng phải đợi hàng cuối.
 */
export const MEDIA_CONCURRENCY = 4;

type Release = () => void;
type Grant = (release: Release) => void;

let active = 0;
const waiting: Array<{ grant: Grant; signal?: AbortSignal }> = [];

function startNext(): void {
    while (active < MEDIA_CONCURRENCY && waiting.length > 0) {
        const next = waiting.shift()!;
        if (next.signal?.aborted) continue; // thẻ đã rời DOM khi còn xếp hàng
        active += 1;
        let released = false;
        next.grant(() => {
            if (released) return;
            released = true;
            active -= 1;
            startNext();
        });
    }
}

/** Đợi tới lượt rồi nhận hàm release (gọi khi tải xong/lỗi/unmount; gọi nhiều lần vô hại). Huỷ bằng signal khi chưa tới lượt ⇒ không bao giờ resolve. */
export function acquireMediaSlot(signal?: AbortSignal): Promise<Release> {
    return new Promise((resolve) => {
        waiting.push({ grant: resolve, signal });
        startNext();
    });
}

/** Chỉ cho test. */
export const mediaQueueState = () => ({ active, waiting: waiting.length });
