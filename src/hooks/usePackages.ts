import { useQuery } from "@tanstack/react-query";
import { packages } from "@/api/billing.api";
import { qk } from "@/lib/queryClient";

export function usePackages() {
    return useQuery({ queryKey: qk.packages, queryFn: packages });
}
