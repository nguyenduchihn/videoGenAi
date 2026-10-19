import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { isValidHandle } from "@/features/generator/modes";
import { formatFileSize } from "./imageSlotFiles";
import type { AttachedImage } from "./types";

interface ImageSlotItemProps {
    item: AttachedImage;
    index: number;
    count: number;
    showIndex: boolean;
    withHandle: boolean;
    onRemove: () => void;
    onHandleChange: (handle: string) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

const ICON_BUTTON = "flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-30";

export default function ImageSlotItem({
    item,
    index,
    count,
    showIndex,
    withHandle,
    onRemove,
    onHandleChange,
    onMoveUp,
    onMoveDown,
}: ImageSlotItemProps) {
    const handle = item.handle.trim();
    const handleInvalid = handle !== "" && !isValidHandle(handle);
    const handleInputId = `handle-${item.localId}`;
    const name = item.file.name;


    return (
        <div className="group relative w-full min-w-0 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
            <div className="relative aspect-square w-full overflow-hidden bg-[var(--app-surface-soft)]">
                {item.previewUrl ? (
                    <img
                        src={item.previewUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center break-all p-2 text-xs text-[var(--app-text-muted)]">
                        {name}
                    </div>
                )}

                {showIndex && (
                    <span
                        className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                        aria-label={`Thứ tự ${index + 1}`}
                    >
                        {index + 1}
                    </span>
                )}

                <div className="absolute right-1 top-1 flex items-center gap-1">
                    {showIndex && count > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={onMoveUp}
                                disabled={!onMoveUp}
                                className={ICON_BUTTON}
                                aria-label={`Chuyển ${name} lên trước`}
                            >
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={onMoveDown}
                                disabled={!onMoveDown}
                                className={ICON_BUTTON}
                                aria-label={`Chuyển ${name} xuống sau`}
                            >
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className={`${ICON_BUTTON} hover:bg-[var(--app-danger)]`}
                        aria-label={`Xóa ${name}`}
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="min-w-0 space-y-1 border-t border-[var(--app-border)] px-1.5 py-1.5">
                <p
                    className="truncate text-[10px] font-medium text-[var(--app-text)]"
                    title={name}
                >
                    {name}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)]">
                    {formatFileSize(item.file.size)}
                </p>

                {item.warning && (
                    <p className="flex items-start gap-1 rounded-md bg-[var(--app-warning-soft)] px-1.5 py-1 text-[10px] text-[var(--app-warning)]">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                        {item.warning}
                    </p>
                )}

                {withHandle && (
                    <div>
                        <label htmlFor={handleInputId} className="sr-only">
                            Tên ảnh để nhắc trong prompt
                        </label>
                        <div
                            className={`flex h-7 items-center rounded-md border bg-[var(--app-surface)] px-1.5 text-xs ${handleInvalid
                                ? "border-[var(--app-danger)]"
                                : "border-[var(--app-border)] focus-within:border-[var(--app-accent)]"
                                }`}
                        >
                            <span className="text-[var(--app-text-muted)]" aria-hidden="true">@</span>
                            <input
                                id={handleInputId}
                                value={item.handle}
                                onChange={(event) => onHandleChange(event.target.value)}
                                placeholder="Tên ảnh"
                                autoComplete="off"
                                spellCheck={false}
                                aria-invalid={handleInvalid}
                                aria-describedby={handleInvalid ? `${handleInputId}-error` : undefined}
                                className="h-full min-w-0 flex-1 bg-transparent px-1 text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
                            />
                        </div>
                        {handleInvalid && (
                            <p
                                id={`${handleInputId}-error`}
                                className="mt-1 break-words text-[10px] text-[var(--app-danger)]"
                            >
                                Chữ thường, số, _ hoặc -, bắt đầu bằng chữ, tối đa 30 ký tự.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
