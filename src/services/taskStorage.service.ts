const STORAGE_PREFIX = "videogenai_active_batches";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type StoredBatch = {
    batchId: string;
    taskIds: string[];
    prompts: string[];
    createdAt: string;
};

/** Mỗi tài khoản một khoá: đổi user trên cùng trình duyệt không thấy lô của người khác. */
const keyFor = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

function isFresh(batch: StoredBatch, now = Date.now()): boolean {
    const created = new Date(batch.createdAt).getTime();
    return Number.isFinite(created) && now - created < MAX_AGE_MS;
}

function write(userId: string, batches: StoredBatch[]): void {
    try {
        localStorage.setItem(keyFor(userId), JSON.stringify(batches));
    } catch {
        /* hết quota hoặc storage bị chặn: bỏ qua, generator vẫn chạy trong bộ nhớ */
    }
}

export const taskStorageService = {
    /** Lô đang theo dõi của user, đã loại lô quá 48 giờ (tránh localStorage phình vô hạn). */
    getBatches(userId: string): StoredBatch[] {
        if (!userId) return [];
        try {
            const raw = localStorage.getItem(keyFor(userId));
            if (!raw) return [];
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return (parsed as StoredBatch[])
                .filter((batch) => typeof batch?.batchId === "string" && Array.isArray(batch.taskIds) && isFresh(batch))
                .map((batch) => ({ ...batch, prompts: Array.isArray(batch.prompts) ? batch.prompts : [] }));
        } catch {
            return [];
        }
    },

    saveBatch(userId: string, batchId: string, taskIds: string[], prompts: string[]): void {
        if (!userId || !batchId) return;
        const next: StoredBatch = { batchId, taskIds, prompts, createdAt: new Date().toISOString() };
        write(userId, [next, ...this.getBatches(userId).filter((batch) => batch.batchId !== batchId)]);
    },

    removeBatch(userId: string, batchId: string): void {
        if (!userId || !batchId) return;
        write(userId, this.getBatches(userId).filter((batch) => batch.batchId !== batchId));
    },
};
