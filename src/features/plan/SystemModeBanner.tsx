import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCommercialMode } from "@/hooks/useCommercialMode";
import type { CommercialMode } from "@/types/api";

const KEY = "videogen:last-mode";

const COPY: Record<CommercialMode, string> = {
    subscription: "Hệ thống vừa chuyển sang bán gói dịch vụ: nạp credit tạm dừng, credit đang có vẫn dùng được với gói trừ credit. Xem mục Gói của tôi.",
    payg: "Hệ thống vừa chuyển sang nạp credit theo lượt: gói dịch vụ không còn bán, hạn gói không còn chặn tạo job.",
};

const readLast = (): string | null => {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
};
const writeLast = (mode: CommercialMode): void => {
    try {
        localStorage.setItem(KEY, mode);
    } catch {
        /* bỏ qua */
    }
};

/** Thông báo một lần khi mô hình bán hàng đổi so với lần trước khách ghé (localStorage). Vùng live luôn có trong DOM để trình đọc màn hình đọc khi nội dung xuất hiện. */
export function SystemModeBanner() {
    const mode = useCommercialMode();
    const [dismissed, setDismissed] = useState(false);
    const last = readLast();
    const show = mode !== null && last !== null && last !== mode && !dismissed;
    useEffect(() => {
        if (mode && readLast() === null) writeLast(mode); // lần ghé đầu: chỉ ghi nhớ, không thông báo
    }, [mode]);
    const dismiss = () => {
        if (mode) writeLast(mode);
        setDismissed(true);
    };
    return (
        <div role="status" aria-live="polite" aria-atomic="true">
            {show && mode && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--app-info)]/40 bg-[var(--app-info-soft)] px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-info)]" aria-hidden="true" />
                    <p className="flex-1 text-sm text-[var(--app-text)]">{COPY[mode]}</p>
                    <button type="button" onClick={dismiss} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:text-[var(--app-text)]" aria-label="Ẩn thông báo">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
