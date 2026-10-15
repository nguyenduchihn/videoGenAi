import { useInfiniteQuery } from "@tanstack/react-query";
import { intents } from "@/api/billing.api";
import { qk } from "@/lib/queryClient";

export function useIntents() {
    return useInfiniteQuery({
        queryKey: qk.intents(),
        queryFn: ({ pageParam }) => intents(pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    });
}
