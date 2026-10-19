import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ACCEPT_ATTR, type ImageRole } from "@/features/generator/modes";
import { attachFiles, moveItem, releasePreview } from "./imageSlotFiles";
import ImageSlotItem from "./imageSlotItem";
import type { AttachedImage } from "./types";

export interface ImageSlotProps {
    role: ImageRole;
    label?: string;
    hint?: string;
    items: AttachedImage[];
    max: number;
    required?: boolean;
    withHandles?: boolean;
    reorder?: boolean;
    hideLabel?: boolean;
    /** Huy hiệu bên phải tiêu đề, vd "Tối đa 3 ảnh". */
    badge?: string;
    onChange: (items: AttachedImage[]) => void;
}

export default function ImageSlot({
    role,
    label,
    hint,
    items,
    max,
    required = false,
    withHandles = false,
    reorder = false,
    hideLabel = false,
    badge,
    onChange,
}: ImageSlotProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const multiple = max > 1;
    const canAddMore = items.length < max;
    const titleId = `slot-${role}-title`;

    useEffect(() => {
        if (errors.length === 0) return;
        const timer = setTimeout(() => setErrors([]), 6_000);
        return () => clearTimeout(timer);
    }, [errors]);

    const addFiles = (files: File[]) => {
        if (files.length === 0) return;
        const base = multiple ? items : [];
        if (!multiple) items.forEach(releasePreview);
        const result = attachFiles(base, files, max);
        setErrors(result.errors);
        onChange(result.items);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(event.target.files ?? []));
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(event.dataTransfer.files));
    };

    const dragProps = {
        onDragEnter: (event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); setIsDragging(true); },
        onDragOver: (event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); setIsDragging(true); },
        onDragLeave: (event: DragEvent<HTMLButtonElement>) => { event.preventDefault(); setIsDragging(false); },
        onDrop: handleDrop,
    };

    const handleRemove = (localId: string) => {
        const target = items.find((item) => item.localId === localId);
        if (target) releasePreview(target);
        setErrors([]);
        onChange(items.filter((item) => item.localId !== localId));
    };

    const handleHandleChange = (localId: string, handle: string) => {
        onChange(items.map((item) => (item.localId === localId ? { ...item, handle } : item)));
    };

    const dropzoneLabel = `${label ? `${label}${required ? " (bắt buộc)" : ""}` : "Ảnh"}: chọn hoặc kéo thả ảnh`;
    const activeClass = isDragging
        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
        : "border-[var(--app-border)] bg-[var(--app-surface-soft)] hover:border-[var(--app-accent)]/60 hover:bg-[var(--app-accent-soft)]/50";


    return (
        <section aria-labelledby={titleId} className="w-full min-w-0 space-y-3">
            {(!hideLabel || hint || badge || label) && (
                <div className="flex min-w-0 items-center justify-between gap-2">
                    <div className="min-w-0">
                        {/* Tiêu đề luôn có (sr-only khi hideLabel) để section là vùng có tên cho trình đọc màn hình */}
                        {label && (
                            <h3
                                id={titleId}
                                className={hideLabel ? "sr-only" : "text-sm font-medium text-[var(--app-text)]"}
                            >
                                {label}
                                {required && (
                                    <span className="ml-1 text-[var(--app-danger)]">*</span>
                                )}
                            </h3>
                        )}
                        {hint && (
                            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                {hint}
                            </p>
                        )}
                    </div>

                    {badge && (
                        <span className="shrink-0 rounded-full border border-[var(--app-border)] px-2 py-1 text-xs text-[var(--app-text-muted)]">
                            {badge}
                        </span>
                    )}
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
                tabIndex={-1}
            />
            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2">
                <ul className="flex w-max min-w-full items-start gap-2">
                    {canAddMore && (
                        <li className="w-20 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    const input = inputRef.current;
                                    if (input) {
                                        input.click();
                                    } else {
                                        console.error("Không tìm thấy input chọn ảnh");
                                    }
                                }}
                                aria-label={dropzoneLabel}
                                {...dragProps}
                                className={`group flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-2 text-center transition ${activeClass}`}
                            >
                                <Upload className="h-4 w-4" aria-hidden="true" />
                                <span className="text-xs font-medium">Thêm ảnh</span>
                                <span className="text-[10px] text-[var(--app-text-muted)]">
                                    {items.length}/{max}
                                </span>
                            </button>
                        </li>

                    )}

                    {items.map((item, index) => (
                        <li key={item.localId} className="w-20 shrink-0">
                            <ImageSlotItem
                                item={item}
                                index={index}
                                count={items.length}
                                showIndex={reorder}
                                withHandle={withHandles}
                                onRemove={() => handleRemove(item.localId)}
                                onHandleChange={(handle) =>
                                    handleHandleChange(item.localId, handle)
                                }
                                onMoveUp={
                                    reorder && index > 0
                                        ? () => onChange(moveItem(items, index, index - 1))
                                        : undefined
                                }
                                onMoveDown={
                                    reorder && index < items.length - 1
                                        ? () => onChange(moveItem(items, index, index + 1))
                                        : undefined
                                }
                            />
                        </li>
                    ))}
                </ul>
            </div>

            {errors.length > 0 && (
                <ul role="alert" className="space-y-1 text-xs text-[var(--app-danger)]">
                    {errors.map((message) => (
                        <li key={message}>{message}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
