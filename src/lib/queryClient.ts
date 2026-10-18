import { QueryClient } from "@tanstack/react-query";
import type { GetTasksParams, RunStatus, TaskStatus } from "@/types/api";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
});

export const qk = {
    me: ["me"] as const,
    pricing: ["pricing"] as const,
    packages: ["packages"] as const,
    models: ["models"] as const,
    ledger: (cursor?: string) => ["ledger", cursor ?? null] as const,
    tasks: (params?: GetTasksParams) => ["tasks", params ?? {}] as const,
    /** Thư viện media: các trang task succeeded, tải dần khi cuộn. */
    library: ["tasks", "library"] as const,
    intents: (cursor?: string, kind?: string) => ["intents", cursor ?? null, kind ?? "all"] as const,
    runs: (status?: RunStatus) => ["runs", status ?? "all"] as const,
    /** Bản kê lượt đang gửi dở (IndexedDB) của một khách. */
    runManifests: (userId: string) => ["run-manifests", userId] as const,
    run: (id: string) => ["run", id] as const,
    runTasks: (id: string, status?: TaskStatus) => ["run", id, "tasks", status ?? "all"] as const,
};
