import { ACCEPTED_IMAGE_MIME, GOOGLE_SOFT_LIMIT_BYTES, MAX_FILE_BYTES } from "@/features/generator/modes";
import type { AttachedImage } from "./types";

const EXT_RE = /\.(png|jpe?g|webp|gif|avif)$/i;
const MB = 1024 * 1024;
export const LARGE_IMAGE_WARNING = "Ảnh lớn hơn 16 MB có thể bị Google từ chối.";

export function formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < MB) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / MB).toFixed(1)} MB`;
}

const isAcceptedImage = (file: File): boolean =>
    ACCEPTED_IMAGE_MIME.includes(file.type) || (!file.type && EXT_RE.test(file.name));

const sameFile = (a: File, b: File): boolean => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const createPreview = (file: File): string => (typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : "");

export function releasePreview(item: AttachedImage): void {
    if (item.previewUrl && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(item.previewUrl);
}

/** Thêm file vào slot: kiểm định dạng/cỡ, bỏ trùng, giữ đúng giới hạn; trả lỗi để hiện tại chỗ. */
export function attachFiles(existing: AttachedImage[], files: File[], max: number): { items: AttachedImage[]; errors: string[] } {
    const items = [...existing];
    const errors: string[] = [];
    let overflow = false;
    for (const file of files) {
        if (!isAcceptedImage(file)) {
            errors.push(`Tệp ${file.name}: định dạng không được hỗ trợ — chấp nhận PNG, JPG, WEBP, GIF, AVIF.`);
            continue;
        }
        if (file.size > MAX_FILE_BYTES) {
            errors.push(`Tệp ${file.name} vượt giới hạn 20 MB — vui lòng chọn tệp nhỏ hơn.`);
            continue;
        }
        if (items.some((item) => sameFile(item.file, file))) continue;
        if (items.length >= max) {
            overflow = true;
            continue;
        }
        items.push({
            localId: crypto.randomUUID(),
            file,
            previewUrl: createPreview(file),
            handle: "",
            ...(file.size > GOOGLE_SOFT_LIMIT_BYTES ? { warning: LARGE_IMAGE_WARNING } : {}),
        });
    }
    if (overflow) errors.push(max === 1 ? "Chỉ chọn 1 ảnh cho vị trí này." : `Chỉ chọn tối đa ${max} ảnh.`);
    return { items, errors };
}

/** Đổi vị trí một ảnh (▲▼); ngoài biên thì giữ nguyên. */
export function moveItem(items: AttachedImage[], from: number, to: number): AttachedImage[] {
    if (to < 0 || to >= items.length || from === to) return items;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    return next;
}
