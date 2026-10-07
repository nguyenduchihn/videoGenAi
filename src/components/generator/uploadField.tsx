import {
    FileImage,
    FileVideo,
    Music,
    Upload,
    X,
} from "lucide-react";
import type {
    ChangeEvent,
    DragEvent,
} from "react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

interface UploadFile {
    id: string;
    file: File;
    preview?: string;
}

interface UploadFieldProps {
    title: string;
    description: string;
    accept: string;
    acceptLabel?: string;
    multiple?: boolean;
    maxFiles?: number;
    minHeight?: string;
    onFilesChange?: (
        files: File[],
    ) => void;
}

function createFileId(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`;
}

function formatFileSize(size: number) {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    }

    return `${(
        size /
        (1024 * 1024 * 1024)
    ).toFixed(1)} GB`;
}

function getFileIcon(file: File) {
    if (file.type.startsWith("image/")) {
        return (
            <FileImage className="h-4 w-4" />
        );
    }

    if (file.type.startsWith("video/")) {
        return (
            <FileVideo className="h-4 w-4" />
        );
    }

    if (file.type.startsWith("audio/")) {
        return (
            <Music className="h-4 w-4" />
        );
    }

    return (
        <Upload className="h-4 w-4" />
    );
}

function isImage(file: File) {
    return file.type.startsWith("image/");
}

function isVideo(file: File) {
    return file.type.startsWith("video/");
}

export default function UploadField({
    title,
    description,
    accept,
    acceptLabel,
    multiple = false,
    maxFiles = 10,
    minHeight = "min-h-[150px]",
    onFilesChange,
}: UploadFieldProps) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    const [
        files,
        setFiles,
    ] = useState<UploadFile[]>([]);

    const [
        isDragging,
        setIsDragging,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    useEffect(() => {
        onFilesChange?.(
            files.map(
                (item) => item.file,
            ),
        );
    }, [files, onFilesChange]);

    useEffect(() => {
        return () => {
            files.forEach((item) => {
                if (item.preview) {
                    URL.revokeObjectURL(
                        item.preview,
                    );
                }
            });
        };
    }, []);

    const processFiles = (
        selectedFiles: File[],
    ) => {
        if (selectedFiles.length === 0) {
            return;
        }

        setError("");

        const nextFiles = multiple
            ? selectedFiles.slice(
                0,
                maxFiles,
            )
            : selectedFiles.slice(0, 1);

        if (
            multiple &&
            selectedFiles.length > maxFiles
        ) {
            setError(
                `Chỉ có thể chọn tối đa ${maxFiles} file.`,
            );
        }

        const uploadFiles: UploadFile[] =
            nextFiles.map((file) => ({
                id: createFileId(file),
                file,
                preview:
                    isImage(file) ||
                        isVideo(file)
                        ? URL.createObjectURL(
                            file,
                        )
                        : undefined,
            }));

        setFiles((current) => {
            if (!multiple) {
                current.forEach((item) => {
                    if (item.preview) {
                        URL.revokeObjectURL(
                            item.preview,
                        );
                    }
                });

                return uploadFiles;
            }

            const merged = [
                ...current,
                ...uploadFiles,
            ];

            const unique = merged.filter(
                (item, index, array) =>
                    array.findIndex(
                        (candidate) =>
                            candidate.file.name ===
                            item.file.name &&
                            candidate.file.size ===
                            item.file.size &&
                            candidate.file.lastModified ===
                            item.file.lastModified,
                    ) === index,
            );

            if (unique.length > maxFiles) {
                unique
                    .slice(maxFiles)
                    .forEach((item) => {
                        if (item.preview) {
                            URL.revokeObjectURL(
                                item.preview,
                            );
                        }
                    });

                setError(
                    `Chỉ có thể chọn tối đa ${maxFiles} file.`,
                );

                return unique.slice(
                    0,
                    maxFiles,
                );
            }

            return unique;
        });
    };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const selected = Array.from(
            event.target.files ?? [],
        );

        processFiles(selected);

        event.target.value = "";
    };

    const handleDrop = (
        event: DragEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        const droppedFiles =
            Array.from(
                event.dataTransfer.files,
            );

        processFiles(droppedFiles);
    };

    const handleRemove = (
        id: string,
    ) => {
        setFiles((current) => {
            const target =
                current.find(
                    (item) =>
                        item.id === id,
                );

            if (target?.preview) {
                URL.revokeObjectURL(
                    target.preview,
                );
            }

            return current.filter(
                (item) =>
                    item.id !== id,
            );
        });

        setError("");
    };

    const handleChoose = () => {
        inputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={
                    handleInputChange
                }
                className="hidden"
            />

            {files.length === 0 ? (
                <button
                    type="button"
                    onClick={handleChoose}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    className={`
                        group flex w-full
                        ${minHeight}
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border border-dashed
                        px-5 py-6
                        text-center
                        transition
                        ${isDragging
                            ? "border-violet-400 bg-violet-50"
                            : "border-gray-200 bg-gray-50/50 hover:border-violet-300 hover:bg-violet-50/40"
                        }
                    `}
                >
                    <span
                        className="
                            flex h-11 w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-gray-400
                            shadow-sm
                            ring-1
                            ring-gray-100
                            transition
                            group-hover:bg-violet-100
                            group-hover:text-violet-600
                        "
                    >
                        <Upload className="h-5 w-5" />
                    </span>

                    <span className="mt-3 text-sm font-medium text-gray-700">
                        {title}
                    </span>

                    <span className="mt-1 max-w-[320px] text-xs leading-5 text-gray-400">
                        {description}
                    </span>

                    <span className="mt-2 text-[11px] text-gray-300">
                        {acceptLabel ??
                            accept}
                        {multiple &&
                            ` • Tối đa ${maxFiles} file`}
                    </span>
                </button>
            ) : (
                <div className="space-y-3">
                    {/* Preview */}
                    <div
                        className={`
                            grid gap-3
                            ${multiple
                                ? "grid-cols-2 sm:grid-cols-3"
                                : "grid-cols-1"
                            }
                        `}
                    >
                        {files.map(
                            (item) => (
                                <div
                                    key={
                                        item.id
                                    }
                                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                >
                                    {item.preview &&
                                        isImage(
                                            item.file,
                                        ) ? (
                                        <img
                                            src={
                                                item.preview
                                            }
                                            alt={
                                                item.file
                                                    .name
                                            }
                                            className="
                                                aspect-video
                                                w-full
                                                object-cover
                                            "
                                        />
                                    ) : item.preview &&
                                        isVideo(
                                            item.file,
                                        ) ? (
                                        <video
                                            src={
                                                item.preview
                                            }
                                            controls
                                            className="
                                                aspect-video
                                                w-full
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center text-gray-400">
                                            {getFileIcon(
                                                item.file,
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemove(
                                                item.id,
                                            )
                                        }
                                        className="
                                            absolute
                                            right-2
                                            top-2
                                            flex
                                            h-7 w-7
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-black/60
                                            text-white
                                            opacity-100
                                            transition
                                            hover:bg-red-500
                                        "
                                        aria-label={`Xóa ${item.file.name}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="border-t border-gray-200 bg-white px-3 py-2">
                                        <p className="truncate text-xs font-medium text-gray-700">
                                            {
                                                item.file
                                                    .name
                                            }
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-gray-400">
                                            {formatFileSize(
                                                item
                                                    .file
                                                    .size,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>


                    {multiple &&
                        files.length <
                        maxFiles && (
                            <button
                                type="button"
                                onClick={
                                    handleChoose
                                }
                                onDragEnter={(
                                    event,
                                ) => {
                                    event.preventDefault();
                                    setIsDragging(
                                        true,
                                    );
                                }}
                                onDragOver={(
                                    event,
                                ) => {
                                    event.preventDefault();
                                    setIsDragging(
                                        true,
                                    );
                                }}
                                onDragLeave={(
                                    event,
                                ) => {
                                    event.preventDefault();
                                    setIsDragging(
                                        false,
                                    );
                                }}
                                onDrop={
                                    handleDrop
                                }
                                className={`
                                    flex w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-dashed
                                    px-4 py-3
                                    text-xs
                                    font-medium
                                    transition
                                    ${isDragging
                                        ? "border-violet-400 bg-violet-50 text-violet-600"
                                        : "border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50/40 hover:text-violet-600"
                                    }
                                `}
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Thêm file
                            </button>
                        )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}