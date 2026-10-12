const STORAGE_KEY = "videogenai_active_batches";

export type StoredBatch = {
    batchId: string;
    taskIds: string[];
    prompts: string[];
    createdAt: string;
};

export const taskStorageService = {
    getBatches(): StoredBatch[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) return [];

            const parsed: unknown = JSON.parse(raw);

            if (!Array.isArray(parsed)) return [];

            return parsed.map((batch) => ({
                ...batch,
                prompts: Array.isArray(batch.prompts)
                    ? batch.prompts
                    : [],
            }));
        } catch {
            return [];
        }
    },

    saveBatch(
        batchId: string,
        taskIds: string[],
        prompts: string[],
    ): void {
        const batches = this.getBatches();

        const nextBatch: StoredBatch = {
            batchId,
            taskIds,
            prompts,
            createdAt: new Date().toISOString(),
        };

        const updated = [
            nextBatch,
            ...batches.filter(
                (batch) => batch.batchId !== batchId,
            ),
        ];

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updated),
        );
    },

    removeBatch(batchId: string): void {
        const updated = this.getBatches().filter(
            (batch) => batch.batchId !== batchId,
        );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updated),
        );
    },
};