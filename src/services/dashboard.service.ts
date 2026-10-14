import { listPortalTasks, me, pricing } from "@/api/portal.api";
import type { DashboardData, GetTasksParams, PortalMeResponse, PortalPricingResponse, PortalTasksResponse } from "@/types/api";

/** Giữ API cũ cho các trang chưa chuyển sang hooks; không còn nhánh mock (MSW lo khi VITE_USE_MOCK_API=true). */
export const dashboardService = {
    getMe: (): Promise<PortalMeResponse> => me(),
    getTasks: (params?: GetTasksParams): Promise<PortalTasksResponse> => listPortalTasks(params ?? {}),
    getPricing: (): Promise<PortalPricingResponse> => pricing(),
    async getDashboardData(): Promise<DashboardData> {
        const [meData, tasks, pricingData] = await Promise.all([me(), listPortalTasks({ limit: 20 }), pricing()]);
        return { me: meData, tasks, pricing: pricingData };
    },
};
