import { QueryClient } from "@tanstack/react-query";
import type { GetTasksParams } from "@/types/api";

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
    intents: (cursor?: string) => ["intents", cursor ?? null] as const,
};
