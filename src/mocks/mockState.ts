// ── Trạng thái mock sống qua tải lại trang (sessionStorage, theo tab) — mô phỏng "máy chủ là nguồn sự thật" ──
const KEY_PREFIX = "videogen:mock-state:";

export function loadMockState<T>(name: string): T | null {
    try {
        const raw = sessionStorage.getItem(KEY_PREFIX + name);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

const pending = new Map<string, () => unknown>();
let scheduled = false;

/** Gom nhiều lần ghi trong cùng một lượt xử lý thành một lần serialize (lượt 1.000 job vẫn nhẹ). */
export function scheduleMockPersist(name: string, snapshot: () => unknown): void {
    pending.set(name, snapshot);
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
        scheduled = false;
        for (const [key, take] of pending) {
            try {
                sessionStorage.setItem(KEY_PREFIX + key, JSON.stringify(take()));
            } catch {
                /* sessionStorage không khả dụng (SSR/test) ⇒ chỉ giữ trong bộ nhớ */
            }
        }
        pending.clear();
    }, 0);
}

export function clearMockState(name: string): void {
    try {
        sessionStorage.removeItem(KEY_PREFIX + name);
    } catch {
        /* bỏ qua */
    }
}
