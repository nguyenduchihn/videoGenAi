import { useQuery } from "@tanstack/react-query";

import { models } from "@/api/v1.api";
import { STATIC_FALLBACK, type ModelCatalog } from "@/features/generator/modelCatalog";
import { qk } from "@/lib/queryClient";

/** GET /v1/models dùng cookie phiên (web cùng origin) ⇒ chạy ngay khi đã đăng nhập. */
export function useModels() {
    return useQuery({
        queryKey: qk.models,
        queryFn: models,
        staleTime: 5 * 60 * 1_000,
    });
}

/** Danh mục model cho trình tạo: dữ liệu thật khi có, nếu không dùng bảng tĩnh. */
export function useModelCatalog(): ModelCatalog {
    const { data } = useModels();
    return data ?? STATIC_FALLBACK;
}
