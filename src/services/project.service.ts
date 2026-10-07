import api from "@/services/api";
import { mockTasksResponse } from "@/mocks/tasks.mock";
import type {
    GetTasksParams,
    PortalTask,
    PortalTasksResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !== "false";

export const projectService = {
    async getProjects(
        params?: GetTasksParams
    ): Promise<PortalTasksResponse> {
        if (USE_MOCK_API) {
            let tasks = [...mockTasksResponse.tasks];

            if (params?.status) {
                tasks = tasks.filter(
                    (task) => task.status === params.status
                );
            }

            const limit = params?.limit ?? 20;

            return {
                tasks: tasks.slice(0, limit),
                nextCursor: null,
            };
        }

        const response = await api.get<PortalTasksResponse>(
            "/portal/tasks",
            {
                params,
            }
        );

        return response.data;
    },

    async getProjectById(
        projectId: string
    ): Promise<PortalTask | null> {
        if (USE_MOCK_API) {
            return (
                mockTasksResponse.tasks.find(
                    (task) => task.id === projectId
                ) ?? null
            );
        }

        const response = await api.get<PortalTask>(
            `/portal/tasks/${projectId}`
        );

        return response.data;
    },
};