import { AlertTriangle } from "lucide-react";
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
                        ? "Chọn ảnh khung đầu và khung cuối tương ứng."
                        : "Chọn ảnh khung đầu; prompt mô tả chuyển động."
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

            <div
                className={`grid grid-cols-1 gap-4 ${withEnd ? "sm:grid-cols-2" : ""
                    }`}
            >
                <ImageSlot
                    role="start"
                    label="Khung đầu"
                    required
                    items={attachments.start}
                    max={10}
                    onChange={(start) => onChange({ start })}
                />

                {withEnd && (
                    <ImageSlot
                        role="end"
                        label="Khung cuối"
                        required
                        items={attachments.end}
                        max={10}
                        onChange={(end) => onChange({ end })}
                    />
                )}
            </div>
        </div>
    );
}
