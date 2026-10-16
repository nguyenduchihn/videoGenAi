import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listPortalTasks } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";
import type { PortalTask } from "@/types/api";
import type { MediaItem } from "../library.types";
import { getMediaKind } from "../library.utils";

/** Mỗi lần cuộn tới cuối lấy thêm 50 task (API tối đa 50). Trước đây tải HẾT lịch sử rồi mới hiện ⇒ chờ rất lâu với tài khoản nhiều task. */
export const LIBRARY_PAGE_SIZE = 50;

export function toMediaItems(tasks: PortalTask[]): MediaItem[] {
    const seen = new Set<string>();
    return tasks.flatMap((task) => {
        if (task.status !== "succeeded" || !task.result?.url) return [];
        const kind = getMediaKind(task);
        if (!kind) return [];
        const id = task.result.mediaId || task.id;
        if (seen.has(id)) return [];
        seen.add(id);
        return [{
            id,
            // imageId: để xoá ảnh qua DELETE /v1/images/:id (feat/library); video chưa có API xoá
            imageId: kind === "image" && task.result.mediaId ? task.result.mediaId : undefined,
            url: task.result.url, kind, source: "generated" as const, title: task.model || task.worker, createdAt: task.completedAt || task.updatedAt,
        }];
    });
}

export function useLibraryMedia() {
    const query = useInfiniteQuery({
        queryKey: qk.library,
        queryFn: ({ pageParam }) => listPortalTasks({ status: "succeeded", cursor: pageParam as string | undefined, limit: LIBRARY_PAGE_SIZE }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        staleTime: 60_000,
    });

    const tasks = useMemo(() => query.data?.pages.flatMap((page) => page.tasks) ?? [], [query.data]);
    const media = useMemo(() => toMediaItems(tasks), [tasks]);

    return {
        tasks,
        media,
        loading: query.isLoading,
        error: query.error ? "Không thể tải thư viện. Vui lòng thử lại." : "",
        loadTasks: () => void query.refetch(),
        hasMore: query.hasNextPage,
        loadingMore: query.isFetchingNextPage,
        loadMore: () => { if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage(); },
    };
}
