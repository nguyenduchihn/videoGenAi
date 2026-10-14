import { useQuery } from "@tanstack/react-query";
import { pricing } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";

export function usePricing() {
    return useQuery({ queryKey: qk.pricing, queryFn: pricing });
}
