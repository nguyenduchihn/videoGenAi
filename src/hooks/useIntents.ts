import { useInfiniteQuery } from "@tanstack/react-query";
import { intents } from "@/api/billing.api";
import { qk } from "@/lib/queryClient";
import type { PaymentIntentKind } from "@/types/api";

/** Lịch sử lệnh thanh toán; `kind` lọc ở máy chủ (phân trang đúng theo loại). */
export function useIntents(kind?: PaymentIntentKind) {
    return useInfiniteQuery({
        queryKey: qk.intents(undefined, kind),
        queryFn: ({ pageParam }) => intents(pageParam as string | undefined, 20, kind),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    });
}
