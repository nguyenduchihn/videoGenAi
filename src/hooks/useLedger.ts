import { useInfiniteQuery } from "@tanstack/react-query";
import { ledger } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";

export function useLedger() {
    return useInfiniteQuery({
        queryKey: qk.ledger(),
        queryFn: ({ pageParam }) => ledger(pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    });
}
