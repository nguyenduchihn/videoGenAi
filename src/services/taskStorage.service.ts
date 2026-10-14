const STORAGE_KEY = "videogenai_active_batches";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type StoredBatch = {
    batchId: string;
    taskIds: string[];
    prompts: string[];
    createdAt: string;
};

function isFresh(batch: StoredBatch, now = Date.now()): boolean {
    const created = new Date(batch.createdAt).getTime();
    return Number.isFinite(created) && now - created < MAX_AGE_MS;
}

function write(batches: StoredBatch[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch {
        /* hết quota hoặc storage bị chặn: bỏ qua, generator vẫn chạy trong bộ nhớ */
    }
}

export const taskStorageService = {
    /** Lô đang theo dõi, đã loại lô quá 48 giờ (tránh localStorage phình vô hạn). */
    getBatches(): StoredBatch[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return (parsed as StoredBatch[])
                .filter((batch) => typeof batch?.batchId === "string" && isFresh(batch))
                .map((batch) => ({ ...batch, prompts: Array.isArray(batch.prompts) ? batch.prompts : [] }));
        } catch {
            return [];
        }
    },

    saveBatch(batchId: string, taskIds: string[], prompts: string[]): void {
        const next: StoredBatch = { batchId, taskIds, prompts, createdAt: new Date().toISOString() };
        write([next, ...this.getBatches().filter((batch) => batch.batchId !== batchId)]);
    },

    removeBatch(batchId: string): void {
        write(this.getBatches().filter((batch) => batch.batchId !== batchId));
    },
};
