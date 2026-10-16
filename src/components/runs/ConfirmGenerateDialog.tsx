import { useState } from "react";
import { Modal } from "@/components/ui";

interface ConfirmGenerateDialogProps {
    open: boolean;
    jobCount: number;
    estimatedCredits: number;
    balance: number | null;
    /** Phần job vượt hạn mức hàng đợi của gói sẽ xếp hàng trên máy chủ. */
    queuedOnServer: number;
    defaultName: string;
    onConfirm: (name: string | null) => void;
    onCancel: () => void;
}

/** Xác nhận khi tạo lô lớn (> 20 job): số job, credit vs số dư, tên lượt tuỳ chọn. */
export default function ConfirmGenerateDialog({ open, jobCount, estimatedCredits, balance, queuedOnServer, defaultName, onConfirm, onCancel }: ConfirmGenerateDialogProps) {
    const [name, setName] = useState("");
    const close = (confirm: boolean) => {
        const trimmed = name.trim();
        setName("");
        if (confirm) onConfirm(trimmed || null); else onCancel();
    };
    const insufficient = balance !== null && estimatedCredits > balance;
    return (
        <Modal open={open} onClose={() => close(false)} title="Xác nhận tạo lô" size="sm">
            <div className="space-y-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-xs text-[var(--app-text-muted)]">Số job</dt><dd className="mt-0.5 text-lg font-semibold text-[var(--app-text)]">{jobCount.toLocaleString("vi-VN")}</dd></div>
                    <div><dt className="text-xs text-[var(--app-text-muted)]">Dự kiến</dt><dd className={`mt-0.5 text-lg font-semibold ${insufficient ? "text-[var(--app-warning)]" : "text-[var(--app-text)]"}`}>{estimatedCredits.toLocaleString("vi-VN")} credit</dd></div>
                    {balance !== null && <div><dt className="text-xs text-[var(--app-text-muted)]">Số dư</dt><dd className="mt-0.5 text-lg font-semibold text-[var(--app-text)]">{balance.toLocaleString("vi-VN")}</dd></div>}
                </dl>
                {queuedOnServer > 0 && (
                    <p className="rounded-xl bg-[var(--app-info-soft)] px-3 py-2 text-xs text-[var(--app-info)]">
                        {queuedOnServer.toLocaleString("vi-VN")} job vượt hạn mức hàng đợi của gói sẽ xếp hàng trên máy chủ và tự chạy dần — đóng tab vẫn chạy.
                    </p>
                )}
                {insufficient && <p role="alert" className="text-xs text-[var(--app-warning)]">Không đủ credit cho cả lượt; phần thiếu sẽ tạm dừng tới khi bạn nạp thêm.</p>}
                <div>
                    <label htmlFor="confirm-run-name" className="mb-1 block text-xs font-medium text-[var(--app-text-secondary)]">Tên lượt tạo (không bắt buộc)</label>
                    <input id="confirm-run-name" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} placeholder={defaultName} className="h-10 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]" />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => close(false)} className="h-10 rounded-xl border border-[var(--app-border)] px-4 text-sm font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)]">Huỷ</button>
                    <button type="button" onClick={() => close(true)} className="h-10 rounded-xl bg-[var(--app-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)]">Tạo {jobCount.toLocaleString("vi-VN")} job →</button>
                </div>
            </div>
        </Modal>
    );
}
