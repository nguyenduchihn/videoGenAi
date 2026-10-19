import { useCallback } from "react";
import { maxReferences, OMNI_MODEL } from "@/features/generator/modes";
import ImageSlot from "../imageSlot";
import type { GeneratorAttachments } from "../types";
import VoicePicker from "../voice/VoicePicker";
import SectionTitle from "./SectionTitle";


interface ReferenceContentProps {
    attachments: GeneratorAttachments;
    model: string;
    onChange: (patch: Partial<GeneratorAttachments>) => void;
    audioEnabled: boolean;
    onEnableAudio: () => void;
}

export default function ReferenceContent({ attachments, model, onChange, audioEnabled, onEnableAudio }: ReferenceContentProps) {
    const onVoiceChange = useCallback((voice: string) => onChange({ voice }), [onChange]);
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
                <SectionTitle
                    title="Giọng nói"
                    description="Tuỳ chọn. Chọn một giọng để mọi video trong lượt nói cùng một chất giọng."
                />
                <VoicePicker
                    value={attachments.voice}
                    onChange={onVoiceChange}
                    audioEnabled={audioEnabled}
                    onEnableAudio={onEnableAudio}
                />
            </div>
        </div>
    );
}