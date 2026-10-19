import { maxReferences, OMNI_MODEL } from "@/features/generator/modes";
import ImageSlot from "../imageSlot";
import type { GeneratorAttachments } from "../types";
import SectionTitle from "./SectionTitle";
import VoiceSelector from "./VoiceSelector";


interface ReferenceContentProps {
    attachments: GeneratorAttachments;
    model: string;
    onChange: (patch: Partial<GeneratorAttachments>) => void;
}

export default function ReferenceContent({ attachments, model, onChange }: ReferenceContentProps) {
    const max = maxReferences(model);
    const hint = model === OMNI_MODEL ? "Đang dùng Veo 3.1 Omni: nhận tới 7 ảnh." : "Chọn model Veo 3.1 Omni trong Cài đặt để dùng tới 7 ảnh.";

    return (
        <div className="mt-5 space-y-5">
            <div>
                <SectionTitle title="Ảnh tham chiếu" description="Giữ nhân vật, đồ vật hoặc phong cách trong video. Đặt @tên để nhắc tới ảnh trong prompt." />
                <ImageSlot
                    role="references"
                    label="Ảnh tham chiếu"
                    hideLabel
                    hint={hint}
                    badge={`Tối đa ${max} ảnh`}
                    required
                    withHandles
                    reorder
                    items={attachments.references}
                    max={max}
                    onChange={(references) => onChange({ references })}
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--app-text)]">
                    Giọng nói{" "}
                    <span className="text-xs font-normal text-[var(--app-text-muted)]">
                        (tuỳ chọn)
                    </span>
                </label>

                <VoiceSelector
                    value={attachments.voice}
                    onChange={(voice) => onChange({ voice })}
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-[var(--app-text-muted)]">
                        {attachments.voice
                            ? `ID gửi lên API: ${attachments.voice}`
                            : "Sử dụng cấu hình giọng mặc định của model."}
                    </p>

                    {attachments.voice && (
                        <button
                            type="button"
                            onClick={() => onChange({ voice: "" })}
                            className="shrink-0 text-xs font-medium text-[var(--app-accent)] hover:underline"
                        >
                            Bỏ chọn
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}