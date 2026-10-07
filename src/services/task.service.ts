import api from "@/services/api";

import type {
    BatchTasksResponse,
    CreateTasksRequest,
    CreateTasksResponse,
    PortalTask,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !== "false";

export const taskService = {
    async createTasks(
        payload: CreateTasksRequest,
        idempotencyKey = crypto.randomUUID(),
    ): Promise<CreateTasksResponse> {
        if (USE_MOCK_API) {
            throw new Error(
                "Mock createTasks chưa được triển khai",
            );
        }

        const response =
            await api.post<CreateTasksResponse>(
                "/v1/tasks",
                payload,
                {
                    withCredentials: false,
                    headers: {
                        "Idempotency-Key":
                            idempotencyKey,
                    },
                },
            );

        return response.data;
    },

    async getTask(
        taskId: string,
    ): Promise<PortalTask> {
        const response =
            await api.get<PortalTask>(
                `/v1/tasks/${taskId}`,
                {
                    withCredentials: false,
                }
            );
        return response.data;
    },

    async getBatch(
        batchId: string,
    ): Promise<BatchTasksResponse> {
        const response =
            await api.get<BatchTasksResponse>(
                `/v1/batches/${batchId}`,
                {
                    withCredentials: false,
                }
            );

        return response.data;
    },

    async cancelTask(
        taskId: string,
    ): Promise<PortalTask> {
        const response =
            await api.post<PortalTask>(
                `/v1/tasks/${taskId}/cancel`,
                {
                    withCredentials: false,
                }
            );

        return response.data;
    },

    async cancelBatch(
        batchId: string,
    ): Promise<BatchTasksResponse> {
        const response =
            await api.post<BatchTasksResponse>(
                `/v1/batches/${batchId}/cancel`,
                {
                    withCredentials: false,
                }
            );

        return response.data;
    },
};