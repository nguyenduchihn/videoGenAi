import { useQuery } from "@tanstack/react-query";
import { me } from "@/api/portal.api";
import { qk } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/auth.store";

export function useMe() {
    const setUser = useAuthStore((s) => s.setUser);
    return useQuery({
        queryKey: qk.me,
        queryFn: async () => {
            const data = await me();
            setUser(data);
            return data;
        },
        // 401 là kết luận chắc chắn: không retry để MainLayout chuyển về /login ngay.
        retry: false,
    });
}
