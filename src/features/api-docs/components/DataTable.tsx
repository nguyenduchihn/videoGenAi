import type { Inline as InlineText, Param } from "../content/types";
import { Inline } from "./Inline";

/** Bảng chung: cuộn ngang trong khung trên màn hẹp, hàng đầu là tiêu đề cột thật (th scope). */
export function DataTable({ head, rows, caption }: { head: string[]; rows: InlineText[][]; caption?: string }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-app-border" tabIndex={0} role="group" aria-label={caption ?? head.join(", ")}>
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead>
                    <tr className="bg-app-surface-soft">
                        {head.map((h) => (
                            <th key={h} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-app-text-secondary">
                                <Inline text={h} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                    {rows.map((row, i) => (
                        <tr key={i} className="bg-app-surface align-top transition-colors hover:bg-app-surface-soft/60">
                            {row.map((c, j) => (
                                <td key={j} className={`px-4 py-3 leading-6 ${j === 0 ? "font-medium text-app-text" : "text-app-text-secondary"}`}>
                                    <Inline text={c} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Bảng tham số: tên + kiểu + bắt buộc gộp một cột (đọc nhanh trên mobile), mặc định và mô tả cột phải. */
export function ParamTable({ params }: { params: Param[] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-app-border" tabIndex={0} role="group" aria-label="Tham số">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-app-surface-soft">
                        {["Tham số", "Mặc định", "Mô tả"].map((h) => (
                            <th key={h} scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-app-text-secondary">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                    {params.map((p) => (
                        <tr key={p.name} className="bg-app-surface align-top">
                            <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-normal">
                                <code className="font-mono text-[13px] font-semibold text-app-text">{p.name}</code>
                                <span className="mt-1 flex items-center gap-1.5 text-xs">
                                    <span className="font-mono text-app-text-secondary">{p.type}</span>
                                    {p.required && <span className="docs-method docs-method-danger rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">bắt buộc</span>}
                                </span>
                            </th>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-app-text-secondary">{p.defaultValue ?? "—"}</td>
                            <td className="px-4 py-3 leading-6 text-app-text-secondary"><Inline text={p.description} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
