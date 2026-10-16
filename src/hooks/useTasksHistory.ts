import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listPortalTasks } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";
import type { TaskStatus } from "@/types/api";

/** Lịch sử tác vụ: 30 mục/trang (API tối đa 50), mới nhất trước (API sắp xếp createdAt giảm dần). */
export const TASKS_PAGE_SIZE = 30;

/** Một trang lịch sử theo cursor; khi đổi trang giữ dữ liệu trang cũ tới khi trang mới về (không nháy skeleton). */
export function useTasksHistory(params: { status?: TaskStatus; cursor?: string }, options: { enabled?: boolean } = {}) {
    const query = { status: params.status, cursor: params.cursor, limit: TASKS_PAGE_SIZE };
    return useQuery({
        queryKey: qk.tasks(query),
        queryFn: () => listPortalTasks(query),
        placeholderData: keepPreviousData,
        enabled: options.enabled ?? true,
    });
}
