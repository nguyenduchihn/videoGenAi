import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import type { CommercialMode } from "@/types/api";

/**
 * Mô hình bán hàng đang bật: lấy từ /portal/auth/me khi đã đăng nhập, không thì từ /portal/pricing (công khai).
 * Chưa biết (đang tải) ⇒ null để trang không nháy sang nhánh sai.
 */
export function useCommercialMode(): CommercialMode | null {
    const fromMe = useAuthStore((s) => s.user?.commercialMode ?? null);
    const pricing = usePricing();
    return fromMe ?? pricing.data?.commercialMode ?? null;
}
