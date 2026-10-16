import type { HttpMethod } from "../content/types";

// Màu theo ngữ nghĩa: đọc (xanh dương) · tạo (xanh lá) · sửa (vàng) · xoá (đỏ).
const STYLE: Record<HttpMethod, string> = {
    GET: "docs-method docs-method-info",
    POST: "docs-method docs-method-success",
    PUT: "docs-method docs-method-warning",
    PATCH: "docs-method docs-method-warning",
    DELETE: "docs-method docs-method-danger",
};

export function MethodBadge({ method }: { method: HttpMethod }) {
    return <span className={`inline-flex w-16 shrink-0 justify-center rounded-md py-0.5 font-mono text-[11px] font-bold tracking-wide ${STYLE[method]}`}>{method}</span>;
}
