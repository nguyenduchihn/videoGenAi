import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ACCEPT_ATTR, type ImageRole } from "@/features/generator/modes";
import { attachFiles, moveItem, releasePreview } from "./imageSlotFiles";
import ImageSlotItem from "./imageSlotItem";
import type { AttachedImage } from "./types";

export interface ImageSlotProps {
    role: ImageRole;
    label: string;
    hint?: string;
    items: AttachedImage[];
    max: number;
    required?: boolean;
    withHandles?: boolean;
    reorder?: boolean;
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

    const dropzoneLabel = `${label}${required ? " (bắt buộc)" : ""}: chọn hoặc kéo thả ảnh`;
    const activeClass = isDragging
        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
        : "border-[var(--app-border)] bg-[var(--app-surface-soft)] hover:border-[var(--app-accent)]/60 hover:bg-[var(--app-accent-soft)]/50";

    return (
        <section aria-labelledby={titleId} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h4 id={titleId} className="text-sm font-semibold text-[var(--app-text)]">
                        {label}
                        {required && <span className="ml-1 text-xs font-normal text-[var(--app-text-muted)]">(bắt buộc)</span>}
                    </h4>
                    {hint && <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">{hint}</p>}
                </div>
                {badge && (
                    <span className="shrink-0 rounded-full bg-[var(--app-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--app-text-secondary)] ring-1 ring-[var(--app-border)]">
                        {badge}
                    </span>
                )}
            </div>

            <input ref={inputRef} type="file" accept={ACCEPT_ATTR} multiple={multiple} onChange={handleInputChange} className="hidden" tabIndex={-1} />

            {items.length > 0 && (
                <ul className={`grid gap-3 ${multiple ? "grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
                    {items.map((item, index) => (
                        <ImageSlotItem
                            key={item.localId}
                            item={item}
                            index={index}
                            count={items.length}
                            showIndex={reorder}
                            withHandle={withHandles}
                            onRemove={() => handleRemove(item.localId)}
                            onHandleChange={(handle) => handleHandleChange(item.localId, handle)}
                            onMoveUp={reorder && index > 0 ? () => onChange(moveItem(items, index, index - 1)) : undefined}
                            onMoveDown={reorder && index < items.length - 1 ? () => onChange(moveItem(items, index, index + 1)) : undefined}
                        />
                    ))}
                </ul>
            )}

            {canAddMore && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-label={dropzoneLabel}
                    {...dragProps}
                    className={`group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed text-center transition ${
                        items.length === 0 ? "min-h-[150px] px-5 py-6" : "gap-2 px-4 py-3"
                    } ${activeClass}`}
                >
                    {items.length === 0 ? (
                        <>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-sm ring-1 ring-[var(--app-border)] transition group-hover:bg-[var(--app-accent-soft)] group-hover:text-[var(--app-accent)]">
                                <Upload className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="mt-3 text-sm font-medium text-[var(--app-text)]">Kéo thả hoặc chọn ảnh</span>
                            <span className="mt-2 text-[11px] text-[var(--app-text-muted)]">
                                PNG, JPG, WEBP · tối đa 20 MB{multiple && ` · tối đa ${max} ảnh`}
                            </span>
                        </>
                    ) : (
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--app-text-secondary)] group-hover:text-[var(--app-accent)]">
                            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                            Thêm ảnh ({items.length}/{max})
                        </span>
                    )}
                </button>
            )}

            {errors.length > 0 && (
                <ul role="alert" className="space-y-1 text-xs text-[var(--app-danger)]">
                    {errors.map((message) => <li key={message}>{message}</li>)}
                </ul>
            )}
        </section>
    );
}
