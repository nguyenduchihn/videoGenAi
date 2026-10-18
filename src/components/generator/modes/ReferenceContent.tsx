import { MAX_VOICE_LENGTH, maxReferences, OMNI_MODEL } from "@/features/generator/modes";
import ImageSlot from "../imageSlot";
import type { GeneratorAttachments } from "../types";
import SectionTitle from "./SectionTitle";

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
                <label htmlFor="reference-voice" className="mb-1.5 block text-sm font-semibold text-[var(--app-text)]">
                    Giọng nói <span className="text-xs font-normal text-[var(--app-text-muted)]">(tuỳ chọn)</span>
                </label>
                <textarea
                    id="reference-voice"
                    value={attachments.voice}
                    onChange={(event) => onChange({ voice: event.target.value })}
                    maxLength={MAX_VOICE_LENGTH}
                    rows={2}
                    placeholder="vd: giọng nữ trung, nhẹ nhàng, nói tiếng Việt"
                    className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
                />
                <p className="mt-1 text-right text-[11px] text-[var(--app-text-muted)]">{attachments.voice.length}/{MAX_VOICE_LENGTH}</p>
            </div>
        </div>
    );
}
