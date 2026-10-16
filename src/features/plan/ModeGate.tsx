import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCommercialMode } from "@/hooks/useCommercialMode";
import type { CommercialMode } from "@/types/api";

/** Trang chỉ có nghĩa ở một chế độ bán hàng: chế độ khác ⇒ chuyển sang trang tương ứng (/billing ⇄ /my-plan); chưa biết chế độ ⇒ vẫn render để không nháy. */
export function ModeGate({ require, to, children }: { require: CommercialMode; to: string; children: ReactNode }) {
    const mode = useCommercialMode();
    if (mode !== null && mode !== require) return <Navigate to={to} replace />;
    return <>{children}</>;
}
