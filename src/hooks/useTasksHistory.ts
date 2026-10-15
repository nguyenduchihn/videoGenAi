import { useInfiniteQuery } from "@tanstack/react-query";
import { listPortalTasks } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";
import type { TaskStatus } from "@/types/api";

export function useTasksHistory(status?: TaskStatus, options: { enabled?: boolean } = {}) {
    return useInfiniteQuery({
        queryKey: qk.tasks({ status }),
        queryFn: ({ pageParam }) =>
            listPortalTasks({ status, cursor: pageParam as string | undefined, limit: 20 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: options.enabled ?? true,
    });
}
