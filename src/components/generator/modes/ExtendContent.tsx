import SourceVideoPicker, { type SessionVideo } from "../sourceVideoPicker";
import type { GeneratorAttachments } from "../types";
import SectionTitle from "./SectionTitle";

interface ExtendContentProps {
    attachments: GeneratorAttachments;
    videos: SessionVideo[];
    onChange: (patch: Partial<GeneratorAttachments>) => void;
}

export default function ExtendContent({ attachments, videos, onChange }: ExtendContentProps) {
    return (
        <div className="mt-5">
            <SectionTitle title="Chọn video để tiếp tục" description="Prompt mô tả phần tiếp theo; video mới nối liền video gốc." />
            <SourceVideoPicker
                value={attachments.sourceMediaId}
                label={attachments.sourceLabel}
                videos={videos}
                onSelect={(sourceMediaId, sourceLabel) => onChange({ sourceMediaId, sourceLabel })}
                showManualInput
            />
        </div>
    );
}
