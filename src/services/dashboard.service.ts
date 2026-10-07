import {
    mockMeResponse,
} from "@/mocks/auth.mock";

import {
    mockTasksResponse,
} from "@/mocks/tasks.mock";

import {
    mockPricingResponse,
} from "@/mocks/pricing.mock";

import api from "@/services/api";

import type {
    DashboardData,
    GetTasksParams,
    PortalMeResponse,
    PortalPricingResponse,
    PortalTasksResponse,
} from "@/types/api";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API !==
    "false";

export const dashboardService = {
    async getMe(): Promise<PortalMeResponse> {
        if (USE_MOCK_API) {
            return mockMeResponse;
        }

        const response =
            await api.get<PortalMeResponse>(
                "/portal/auth/me"
            );

        return response.data;
    },

    async getTasks(
        params?: GetTasksParams
    ): Promise<PortalTasksResponse> {
        if (USE_MOCK_API) {
            let tasks = [
                ...mockTasksResponse.tasks,
            ];

            if (params?.status) {
                tasks = tasks.filter(
                    (task) =>
                        task.status ===
                        params.status
                );
            }

            const limit =
                params?.limit ?? 20;

            return {
                tasks: tasks.slice(0, limit),
                nextCursor: null,
            };
        }

        const response =
            await api.get<PortalTasksResponse>(
                "/portal/tasks",
                {
                    params,
                }
            );

        return response.data;
    },

    async getPricing(): Promise<PortalPricingResponse> {
        if (USE_MOCK_API) {
            return mockPricingResponse;
        }

        const response =
            await api.get<PortalPricingResponse>(
                "/portal/pricing"
            );

        return response.data;
    },

    async getDashboardData(): Promise<DashboardData> {
        const [
            me,
            tasks,
            pricing,
        ] = await Promise.all([
            this.getMe(),

            this.getTasks({
                limit: 20,
            }),

            this.getPricing(),
        ]);

        return {
            me,
            tasks,
            pricing,
        };
    },
};