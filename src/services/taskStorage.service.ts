const getStorageKey = (userId: string) =>
    `videogenai_active_batches:${userId}`;

export type StoredBatch = {
    batchId: string;
    taskIds: string[];
    prompts: string[];
    createdAt: string;
};

export const taskStorageService = {
    getBatches(userId: string): StoredBatch[] {
        if (!userId) return [];

        try {
            const raw = localStorage.getItem(
                getStorageKey(userId),
            );

            if (!raw) return [];

            const parsed: unknown = JSON.parse(raw);

            if (!Array.isArray(parsed)) return [];

            return parsed
                .filter(
                    (batch): batch is StoredBatch =>
                        batch !== null &&
                        typeof batch === "object" &&
                        typeof batch.batchId === "string" &&
                        Array.isArray(batch.taskIds) &&
                        batch.taskIds.every(
                            (id: unknown) =>
                                typeof id === "string",
                        ),
                )
                .map((batch) => ({
                    batchId: batch.batchId,
                    taskIds: batch.taskIds,
                    prompts: Array.isArray(batch.prompts)
                        ? batch.prompts
                        : [],
                    createdAt:
                        typeof batch.createdAt === "string"
                            ? batch.createdAt
                            : "",
                }));
        } catch (error) {
            console.error(
                "Không thể đọc lịch sử batch:",
                error,
            );
            return [];
        }
    },

    saveBatch(
        userId: string,
        batchId: string,
        taskIds: string[],
        prompts: string[],
    ): void {
        if (!userId || !batchId) return;

        try {
            const batches = this.getBatches(userId);

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
                getStorageKey(userId),
                JSON.stringify(updated),
            );
        } catch (error) {
            console.error(
                "Không thể lưu lịch sử batch:",
                error,
            );
        }
    },

    removeBatch(
        userId: string,
        batchId: string,
    ): void {
        if (!userId || !batchId) return;

        try {
            const updated = this.getBatches(userId).filter(
                (batch) => batch.batchId !== batchId,
            );

            localStorage.setItem(
                getStorageKey(userId),
                JSON.stringify(updated),
            );
        } catch (error) {
            console.error(
                "Không thể xóa lịch sử batch:",
                error,
            );
        }
    },
};
