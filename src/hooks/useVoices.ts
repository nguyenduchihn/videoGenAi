import { useQuery } from "@tanstack/react-query";

import { voices } from "@/api/v1.api";
import { qk } from "@/lib/queryClient";

const DAY_MS = 24 * 60 * 60 * 1_000;

/** GET /v1/voices — danh sách gần như cố định ⇒ giữ 24h. */
export function useVoices() {
    return useQuery({
        queryKey: qk.voices,
        queryFn: voices,
        select: (data) => data.voices,
        staleTime: DAY_MS,
        gcTime: DAY_MS,
    });
}
