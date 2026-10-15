import type { ModeKind } from "@/features/generator/modes";

export default function TextOnlyContent({ kind }: { kind: ModeKind }) {
    const isVideo = kind === "video";
    return (
        <div className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 transition-colors sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">{isVideo ? "Văn bản → Video" : "Văn bản → Ảnh"}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">
                        {isVideo
                            ? "Tạo video từ nội dung mô tả bằng văn bản. Mỗi dòng prompt là một video."
                            : "Tạo ảnh từ mô tả. Muốn giữ nhân vật hoặc phong cách từ ảnh có sẵn? Chọn chế độ Ảnh tham chiếu → Ảnh."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)]">
                        {isVideo ? "AI Video" : "AI Image"}
                    </span>
                    {isVideo && (
                        <span className="rounded-lg bg-[var(--app-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--app-accent)]">Audio</span>
                    )}
                </div>
            </div>
        </div>
    );
}
