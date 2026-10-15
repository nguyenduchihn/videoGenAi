import { useCallback, useEffect, useMemo, useState } from "react";
import { listPortalTasks } from "@/api/portal.api";
import type { PortalTask } from "@/types/api";
import type { MediaItem } from "../library.types";
import { getMediaKind } from "../library.utils";

export function useLibraryMedia() {
    const [tasks, setTasks] = useState<PortalTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const allTasks: PortalTask[] = [];
            const seenTaskIds = new Set<string>();
            const seenCursors = new Set<string>();

            let cursor: string | undefined;

            do {
                const response = await listPortalTasks({
                    cursor,
                    limit: 50,
                });

                for (const task of response.tasks) {
                    if (!seenTaskIds.has(task.id)) {
                        seenTaskIds.add(task.id);
                        allTasks.push(task);
                    }
                }

                const nextCursor = response.nextCursor;

                if (!nextCursor) {
                    break;
                }

                if (seenCursors.has(nextCursor)) {
                    throw new Error("DUPLICATE_CURSOR");
                }

                seenCursors.add(nextCursor);
                cursor = nextCursor;
            } while (cursor);

            setTasks(allTasks);
        } catch (err) {
            console.error("Không thể tải thư viện:", err);
            setError("Không thể tải đầy đủ thư viện. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTasks();
    }, [loadTasks]);

    const media = useMemo<MediaItem[]>(() => {
        return tasks.flatMap((task) => {
            if (task.status !== "succeeded" || !task.result?.url) {
                return [];
            }

            const kind = getMediaKind(task);

            if (!kind) {
                return [];
            }

            return [
                {
                    id: task.result.mediaId || task.id,
                    url: task.result.url,
                    kind,
                    source: "generated" as const,
                    title: task.model || task.worker,
                    createdAt: task.completedAt || task.updatedAt,
                },
            ];
        });
    }, [tasks]);

    return {
        tasks,
        media,
        loading,
        error,
        loadTasks,
    };
}
