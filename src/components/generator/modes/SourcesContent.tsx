import { MAX_SOURCES } from "@/features/generator/modes";
import ImageSlot from "../imageSlot";
import type { GeneratorAttachments } from "../types";
import SectionTitle from "./SectionTitle";

interface SourcesContentProps {
    attachments: GeneratorAttachments;
    onChange: (patch: Partial<GeneratorAttachments>) => void;
}

export default function SourcesContent({ attachments, onChange }: SourcesContentProps) {
    return (
        <div className="mt-5">
            <SectionTitle title="Ảnh nguồn" description="1–10 ảnh để giữ nhân vật, kiểu dáng hoặc bố cục. Đặt @tên để nhắc tới ảnh trong prompt." />
            <ImageSlot
                role="sources"
                label="Ảnh nguồn"
                badge={`Tối đa ${MAX_SOURCES} ảnh`}
                required
                withHandles
                reorder
                items={attachments.sources}
                max={MAX_SOURCES}
                onChange={(sources) => onChange({ sources })}
            />
        </div>
    );
}
