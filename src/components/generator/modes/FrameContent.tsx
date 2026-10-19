import { AlertTriangle } from "lucide-react";
import { MAX_FRAMES } from "@/features/generator/frameJobs";
import { OMNI_MODEL } from "@/features/generator/modes";
import ImageSlot from "../imageSlot";
import type { GeneratorAttachments } from "../types";
import SectionTitle from "./SectionTitle";

interface FrameContentProps {
    attachments: GeneratorAttachments;
    model: string;
    withEnd: boolean;
    onChange: (patch: Partial<GeneratorAttachments>) => void;
}

/** Khung đầu (image-to-video) hoặc Khung đầu + cuối (start-end-image-to-video). */
export default function FrameContent({
    attachments,
    model,
    withEnd,
    onChange,
}: FrameContentProps) {
    return (
        <div className="mt-5">
            <SectionTitle
                title={withEnd ? "Khung đầu + cuối" : "Khung đầu"}
                description={
                    withEnd
                        ? `Mỗi cặp ảnh cùng số thứ tự là một video (tối đa ${MAX_FRAMES}). Một khung chỉ có 1 ảnh ⇒ dùng chung cho mọi cặp.`
                        : `Mỗi ảnh là một video (tối đa ${MAX_FRAMES}). Nhập 1 prompt dùng chung hoặc mỗi ảnh một prompt theo thứ tự.`
                }
            />

            {withEnd && model === OMNI_MODEL && (
                <p
                    role="status"
                    className="mb-3 flex items-start gap-2 rounded-xl bg-[var(--app-warning-soft)] px-3 py-2 text-xs text-[var(--app-warning)]"
                >
                    <AlertTriangle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                    />
                    Veo 3.1 Omni không hỗ trợ Khung đầu + cuối. Chọn Lite,
                    Fast hoặc Quality trong Cài đặt.
                </p>
            )}

            <div className="flex flex-col gap-6 w-full">
                <div className="w-full min-w-0">
                    <ImageSlot
                        role="start"
                        label="Khung đầu"
                        required
                        items={attachments.start}
                        max={MAX_FRAMES}
                        reorder
                        onChange={(start) => onChange({ start })}
                    />
                </div>
                {withEnd && (
                    <div className="w-full min-w-0">
                        <ImageSlot
                            role="end"
                            label="Khung cuối"
                            required
                            items={attachments.end}
                            max={MAX_FRAMES}
                        reorder
                            onChange={(end) => onChange({ end })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
