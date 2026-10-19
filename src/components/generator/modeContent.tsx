import { Info } from "lucide-react";
import { IMAGE_TTL_HOURS, modeSpec } from "@/features/generator/modes";
import FrameContent from "./modes/FrameContent";
import ReferenceContent from "./modes/ReferenceContent";
import SourcesContent from "./modes/SourcesContent";
import TextOnlyContent from "./modes/TextOnlyContent";
import type { GeneratorAttachments, GeneratorMode } from "./types";

interface ModeContentProps {
    mode: GeneratorMode;
    attachments: GeneratorAttachments;
    model: string;
    jobCount: number;
    onChange: (patch: Partial<GeneratorAttachments>) => void;
}

const imageCount = (attachments: GeneratorAttachments): number =>
    attachments.start.length + attachments.end.length + attachments.references.length + attachments.sources.length;

function ModeBody({ mode, attachments, model, onChange }: Omit<ModeContentProps, "jobCount">) {
    switch (mode) {
        case "text-to-video":
            return <TextOnlyContent kind="video" />;
        case "text-to-image":
            return <TextOnlyContent kind="image" />;
        case "image-to-video":
            return <FrameContent attachments={attachments} model={model} withEnd={false} onChange={onChange} />;
        case "start-end-image-to-video":
            return <FrameContent attachments={attachments} model={model} withEnd onChange={onChange} />;
        case "reference-images-to-video":
            return <ReferenceContent attachments={attachments} model={model} onChange={onChange} />;
        case "image-to-image":
            return <SourcesContent attachments={attachments} onChange={onChange} />;
    }
}

export default function ModeContent(props: ModeContentProps) {
    const spec = modeSpec(props.mode);
    const hasImageRoles = Boolean(spec.roles.start || spec.roles.references || spec.roles.sources);
    const count = imageCount(props.attachments);
    return (
        <div>
            <ModeBody {...props} />
            {hasImageRoles && (
                <div className="mt-3 space-y-1 text-[11px] text-[var(--app-text-muted)]">
                    {props.jobCount > 1 && count > 0 && (
                        <p className="flex items-center gap-1.5 text-[var(--app-text-secondary)]">
                            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {count} ảnh này dùng chung cho tất cả {props.jobCount} prompt.
                        </p>
                    )}
                    <p>Ảnh tải lên được giữ {IMAGE_TTL_HOURS} giờ.</p>
                </div>
            )}
        </div>
    );
}
