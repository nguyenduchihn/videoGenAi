import { useQuery } from "@tanstack/react-query";

import { models } from "@/api/v1.api";
import { STATIC_FALLBACK, type ModelCatalog } from "@/features/generator/modelCatalog";
import { qk } from "@/lib/queryClient";
import { useApiKeyStore } from "@/stores/apiKey.store";

/** GET /v1/models cần X-API-Key ⇒ chỉ chạy khi trình duyệt đã có key. */
export function useModels() {
    const hasKey = useApiKeyStore((s) => !!s.key?.raw);
    return useQuery({
        queryKey: qk.models,
        queryFn: models,
        enabled: hasKey,
        staleTime: 5 * 60 * 1_000,
    });
}

/** Danh mục model cho trình tạo: dữ liệu thật khi có, nếu không dùng bảng tĩnh. */
export function useModelCatalog(): ModelCatalog {
    const { data } = useModels();
    return data ?? STATIC_FALLBACK;
}
