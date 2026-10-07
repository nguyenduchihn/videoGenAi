import { useCallback } from "react";

import UploadField from "./uploadField";

import type {
    GeneratorFilesState,
    GeneratorMode,
} from "./types";

interface ModeContentProps {
    mode: GeneratorMode;
    files: GeneratorFilesState;
    onFilesChange: (
        field: keyof GeneratorFilesState,
        files: File[],
    ) => void;
}

function SectionTitle({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-3">
            <h3 className="text-sm font-semibold text-[var(--app-text)]">
                {title}
            </h3>

            {description && (
                <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">
                    {description}
                </p>
            )}
        </div>
    );
}

function TextToVideoContent() {
    return (
        <div className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 transition-colors sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">
                        Text to Video
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">
                        Tạo video từ nội dung mô tả
                        bằng văn bản.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)]">
                        AI Video
                    </span>

                    <span className="rounded-lg bg-[var(--app-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--app-accent)]">
                        Audio
                    </span>
                </div>
            </div>
        </div>
    );
}

function ImageToVideoContent({
    files,
    onFilesChange,
}: {
    files: GeneratorFilesState;
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Khung hình tham chiếu"
                description="Thêm ảnh bắt đầu và ảnh kết thúc để kiểm soát chuyển động của video."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <UploadField
                    title="Start Frame"
                    description="Kéo thả hoặc chọn ảnh khung hình bắt đầu"
                    accept="image/png,image/jpeg,image/webp"
                    acceptLabel="PNG, JPG, WEBP"
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "startFrame",
                            nextFiles,
                        )
                    }
                />

                <UploadField
                    title="End Frame"
                    description="Kéo thả hoặc chọn ảnh khung hình kết thúc"
                    accept="image/png,image/jpeg,image/webp"
                    acceptLabel="PNG, JPG, WEBP"
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "endFrame",
                            nextFiles,
                        )
                    }
                />
            </div>

            {(files.startFrame.length > 0 ||
                files.endFrame.length > 0) && (
                    <p className="mt-3 text-xs text-[var(--app-text-muted)]">
                        {files.startFrame.length > 0
                            ? "Đã chọn Start Frame. "
                            : ""}

                        {files.endFrame.length > 0
                            ? "Đã chọn End Frame."
                            : ""}
                    </p>
                )}
        </div>
    );
}

function ComponentsContent({
    onFilesChange,
}: {
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Thành phần tham chiếu"
                description="Thêm các hình ảnh hoặc thành phần muốn AI giữ lại trong video."
            />

            <UploadField
                title="Thêm thành phần"
                description="Kéo thả hoặc chọn một hoặc nhiều hình ảnh"
                accept="image/png,image/jpeg,image/webp"
                acceptLabel="PNG, JPG, WEBP"
                multiple
                maxFiles={10}
                onFilesChange={(nextFiles) =>
                    onFilesChange(
                        "components",
                        nextFiles,
                    )
                }
            />
        </div>
    );
}

function TextToImageContent({
    onFilesChange,
}: {
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Ảnh tham chiếu"
                description="Không bắt buộc. Thêm ảnh để định hướng phong cách hoặc nội dung."
            />

            <UploadField
                title="Thêm ảnh tham chiếu"
                description="Kéo thả hoặc chọn một hoặc nhiều hình ảnh"
                accept="image/png,image/jpeg,image/webp"
                acceptLabel="PNG, JPG, WEBP"
                multiple
                maxFiles={10}
                onFilesChange={(nextFiles) =>
                    onFilesChange(
                        "referenceImages",
                        nextFiles,
                    )
                }
            />
        </div>
    );
}

function BatchImageContent({
    onFilesChange,
}: {
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Ảnh hàng loạt"
                description="Kết hợp ảnh cố định và ảnh động để tạo nhiều job."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <UploadField
                    title="Ảnh cố định"
                    description="Ảnh được dùng chung cho các job"
                    accept="image/png,image/jpeg,image/webp"
                    acceptLabel="PNG, JPG, WEBP"
                    multiple
                    maxFiles={10}
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "fixedImages",
                            nextFiles,
                        )
                    }
                />

                <UploadField
                    title="Ảnh động"
                    description="Ảnh thay đổi theo từng job"
                    accept="image/png,image/jpeg,image/webp"
                    acceptLabel="PNG, JPG, WEBP"
                    multiple
                    maxFiles={20}
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "dynamicImages",
                            nextFiles,
                        )
                    }
                />
            </div>
        </div>
    );
}

function ReferenceVideoVoiceContent({
    onFilesChange,
}: {
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Reference Video + Voice"
                description="Sử dụng video tham chiếu kết hợp giọng nói hoặc audio."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <UploadField
                    title="Reference Video"
                    description="Kéo thả hoặc chọn video tham chiếu"
                    accept="video/mp4,video/quicktime,video/webm"
                    acceptLabel="MP4, MOV, WEBM"
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "referenceVideos",
                            nextFiles,
                        )
                    }
                />

                <UploadField
                    title="Voice / Audio"
                    description="Kéo thả hoặc chọn file âm thanh"
                    accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                    acceptLabel="MP3, WAV, M4A"
                    minHeight="min-h-[170px]"
                    onFilesChange={(nextFiles) =>
                        onFilesChange(
                            "voiceAudio",
                            nextFiles,
                        )
                    }
                />
            </div>
        </div>
    );
}

function BatchReferenceContent({
    onFilesChange,
}: {
    onFilesChange: ModeContentProps["onFilesChange"];
}) {
    return (
        <div className="mt-5">
            <SectionTitle
                title="Reference hàng loạt"
                description="Thêm nhiều bộ reference để tạo nhiều video theo batch."
            />

            <UploadField
                title="Thêm reference"
                description="Kéo thả hoặc chọn nhiều file reference"
                accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
                acceptLabel="PNG, JPG, WEBP, MP4"
                multiple
                maxFiles={20}
                onFilesChange={(nextFiles) =>
                    onFilesChange(
                        "batchReferences",
                        nextFiles,
                    )
                }
            />
        </div>
    );
}

export default function ModeContent({
    mode,
    files,
    onFilesChange,
}: ModeContentProps) {
    const handleFilesChange = useCallback(
        (
            field: keyof GeneratorFilesState,
            nextFiles: File[],
        ) => {
            onFilesChange(field, nextFiles);
        },
        [onFilesChange],
    );

    switch (mode) {
        case "text-to-video":
            return <TextToVideoContent />;

        case "image-to-video":
            return (
                <ImageToVideoContent
                    files={files}
                    onFilesChange={handleFilesChange}
                />
            );

        case "components":
            return (
                <ComponentsContent
                    onFilesChange={handleFilesChange}
                />
            );

        case "text-to-image":
            return (
                <TextToImageContent
                    onFilesChange={handleFilesChange}
                />
            );

        case "batch-image":
            return (
                <BatchImageContent
                    onFilesChange={handleFilesChange}
                />
            );

        case "reference-video-voice":
            return (
                <ReferenceVideoVoiceContent
                    onFilesChange={handleFilesChange}
                />
            );

        case "batch-reference":
            return (
                <BatchReferenceContent
                    onFilesChange={handleFilesChange}
                />
            );

        default:
            return null;
    }
}