import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Button, CopyButton, ErrorPanel, Sheet, StatusBadge } from "@/components/ui";
import { portalApi } from "@/api/portal.api";
import { useFeedback } from "@/hooks/useFeedback";
import { getErrorMessage } from "@/lib/errors";
import { formatCredits, formatDate } from "@/lib/format";
import { voiceName } from "@/features/generator/voiceLabels";
import { VIDEO_WORKERS, workerLabel } from "./workerLabels";

interface Props {
    id: string | null;
    onClose: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-[var(--app-border)] py-2.5 sm:flex-row sm:gap-4">
            <dt className="w-28 shrink-0 text-xs text-[var(--app-text-muted)]">{label}</dt>
            <dd className="min-w-0 text-sm text-[var(--app-text)]">{children}</dd>
        </div>
    );
}

export default function TaskDetailSheet({ id, onClose }: Props) {
    const qc = useQueryClient();
    const { toast, confirm, withOverlay } = useFeedback();

    const { data: task, isLoading, error } = useQuery({
        queryKey: ["task", id],
        queryFn: () => portalApi.tasks.get(id!),
        enabled: Boolean(id),
    });

    const canCancel = task?.status === "pending" || task?.status === "processing";

    async function handleCancel() {
        if (!task) return;
        const ok = await confirm({ title: "Huỷ tác vụ này?", body: "Credits đã trừ sẽ được hoàn theo chính sách.", confirmLabel: "Huỷ tác vụ", danger: true });
        if (!ok) return;
        try {
            await withOverlay(portalApi.tasks.cancel(task.id), "Đang huỷ…");
            toast.success("Đã huỷ tác vụ.");
            await Promise.all([
                qc.invalidateQueries({ queryKey: ["task", task.id] }),
                qc.invalidateQueries({ queryKey: ["tasks"] }),
            ]);
        } catch (err) {
            toast.error(err);
        }
    }

    return (
        <Sheet open={Boolean(id)} onClose={onClose} title="Chi tiết tác vụ">
            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-7 animate-pulse rounded-lg bg-[var(--app-surface-soft)]" />
                    ))}
                </div>
            )}
            {error && <ErrorPanel message={getErrorMessage(error)} />}
            {task && (
                <dl>
                    <Row label="ID">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                            {task.id.slice(0, 16)}…<CopyButton value={task.id} />
                        </span>
                    </Row>
                    <Row label="Batch ID"><span className="font-mono text-xs">{task.batchId}</span></Row>
                    <Row label="Trạng thái"><StatusBadge status={task.status} /></Row>
                    <Row label="Worker">{workerLabel(task.worker)}</Row>
                    {task.model && <Row label="Model">{task.model}</Row>}
                    {task.voice && <Row label="Giọng nói"><span>{voiceName(task.voice)}</span> <span className="font-mono text-xs text-[var(--app-text-muted)]">({task.voice})</span></Row>}
                    <Row label="Giai đoạn">{task.stage}</Row>
                    <Row label="Credits">{formatCredits(task.priceCredits)}</Row>
                    {task.creditsRefunded > 0 && (
                        <Row label="Hoàn credits">{formatCredits(task.creditsRefunded)}</Row>
                    )}
                    <Row label="Tạo lúc">
                        {formatDate(task.createdAt)}{" "}
                        {new Date(task.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </Row>
                    {task.completedAt && (
                        <Row label="Hoàn tất lúc">
                            {formatDate(task.completedAt)}{" "}
                            {new Date(task.completedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </Row>
                    )}
                    {task.error && (
                        <Row label="Lỗi">
                            <ErrorPanel title={task.error.code} message={task.error.message} />
                        </Row>
                    )}
                    {task.result?.url && (
                        <Row label="Kết quả">
                            <div className="flex flex-col gap-2">
                                {VIDEO_WORKERS.has(task.worker) ? (
                                    <video controls preload="metadata" src={task.result.url} className="w-full rounded-xl" />
                                ) : (
                                    <img src={task.result.url} alt="Kết quả" className="w-full rounded-xl object-contain" />
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <a href={task.result.url} download className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)]">
                                        <Download className="h-3.5 w-3.5" />Tải về
                                    </a>
                                    <a href={task.result.url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)]">
                                        <ExternalLink className="h-3.5 w-3.5" />Mở liên kết
                                    </a>
                                </div>
                                {task.result.upscale && (
                                    <span className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)]">
                                        Upscale:<Badge variant={task.result.upscale.status === "done" ? "success" : "danger"}>{task.result.upscale.status === "done" ? "Hoàn thành" : "Thất bại"}</Badge>
                                    </span>
                                )}
                            </div>
                        </Row>
                    )}
                </dl>
            )}
            {canCancel && (
                <div className="mt-4 border-t border-[var(--app-border)] pt-4">
                    <Button variant="danger" size="sm" onClick={() => void handleCancel()}>Huỷ tác vụ</Button>
                </div>
            )}
        </Sheet>
    );
}
