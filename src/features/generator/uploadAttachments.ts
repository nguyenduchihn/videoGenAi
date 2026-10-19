import { uploadImages, type UploadOptions, type UploadPart } from "@/api/v1.api";
import type { AttachedImage, GeneratorAttachments } from "@/components/generator/types";
import type { ImageRef, UploadImagesResponse } from "@/types/api";
import type { ResolvedAttachments } from "./buildTasks";
import { GeneratorError } from "./errors";
import type { ImageRole } from "./modes";

/** File object ⇒ imageId, sống cùng form: gửi lại cùng bộ ảnh không upload lần nữa. */
export type UploadCache = Map<File, string>;

export const UPLOAD_CHUNK_BYTES = 48 * 1024 * 1024;
export const UPLOAD_CHUNK_FILES = 100;
const ROLES: readonly ImageRole[] = ["start", "end", "references", "sources"];

export interface UploadProgress {
    loaded: number;
    total: number;
}

export interface UploadAttachmentsOptions {
    onProgress?: (progress: UploadProgress) => void;
    signal?: AbortSignal;
    /** Để test thay backend; mặc định gọi POST /v1/images. */
    upload?: (parts: UploadPart[], options: UploadOptions) => Promise<UploadImagesResponse>;
}

interface PendingPart {
    name: string;
    file: File;
}

/** Tên field multipart `${role}_${stt 3 chữ số}` — backend trả lại `name` để ghép id chắc chắn. */
export const partName = (role: ImageRole, index: number): string => `${role}_${String(index + 1).padStart(3, "0")}`;

/** Chia bộ ảnh thành nhiều request: tổng cỡ ≤ maxBytes và ≤ maxFiles mỗi request (1 ảnh quá cỡ vẫn đi một mình). */
export function chunkBySize<T extends { file: File }>(parts: T[], maxBytes: number, maxFiles: number): T[][] {
    return parts.reduce<T[][]>((chunks, part) => {
        const current = chunks[chunks.length - 1];
        const bytes = current?.reduce((sum, p) => sum + p.file.size, 0) ?? 0;
        const fits = current !== undefined && current.length < maxFiles && bytes + part.file.size <= maxBytes;
        return fits ? [...chunks.slice(0, -1), [...current, part]] : [...chunks, [part]];
    }, []);
}

function pendingParts(attachments: GeneratorAttachments, cache: UploadCache): PendingPart[] {
    return ROLES.flatMap((role) =>
        attachments[role]
            .map((item, index) => ({ name: partName(role, index), file: item.file }))
            .filter((part) => !cache.has(part.file)),
    );
}

const refOf = (cache: UploadCache, item: AttachedImage): ImageRef => {
    const imageId = cache.get(item.file);
    if (!imageId) throw new GeneratorError("ATTACHMENT_MISSING", `Ảnh ${item.file.name} chưa được tải lên.`);
    const handle = item.handle.trim();
    return handle ? { imageId, handle } : imageId;
};

const refsOf = (
    cache: UploadCache,
    items: AttachedImage[],
): ImageRef[] => items.map((item) => refOf(cache, item));

/** Ghép imageId từ cache vào vai trò; ném ATTACHMENT_MISSING nếu còn ảnh chưa có id. */
export function resolveFromCache(
    attachments: GeneratorAttachments,
    cache: UploadCache,
): ResolvedAttachments {
    const voice = attachments.voice.trim();

    return {
        start: refsOf(cache, attachments.start),
        end: refsOf(cache, attachments.end),
        references: refsOf(cache, attachments.references),
        sources: refsOf(cache, attachments.sources),
        ...(voice ? { voice } : {}),
    };
}

/** Xoá mọi entry trỏ tới imageId (ảnh hết hạn trên server) để lần gửi sau upload lại. */
export function forgetImageId(cache: UploadCache, imageId: string): boolean {
    let removed = false;
    for (const [file, id] of cache) {
        if (id !== imageId) continue;
        cache.delete(file);
        removed = true;
    }
    return removed;
}

/**
 * Upload các ảnh chưa có trong cache (một request mỗi ≤48 MB/≤100 file), ghép id theo `name`,
 * rồi trả bộ tham chiếu đã đủ id. Server dedup theo sha256 ⇒ gửi lại ảnh cũ chỉ tốn một vòng mạng.
 */
export async function uploadAttachments(
    attachments: GeneratorAttachments,
    cache: UploadCache,
    options: UploadAttachmentsOptions = {},
): Promise<ResolvedAttachments> {
    const pending = pendingParts(attachments, cache);
    const total = pending.reduce((sum, part) => sum + part.file.size, 0);
    let uploadedBefore = 0;
    const upload = options.upload ?? uploadImages;

    for (const group of chunkBySize(pending, UPLOAD_CHUNK_BYTES, UPLOAD_CHUNK_FILES)) {
        const groupBytes = group.reduce((sum, part) => sum + part.file.size, 0);
        const response = await upload(group, {
            signal: options.signal,
            onUploadProgress: (loaded) => options.onProgress?.({ loaded: uploadedBefore + Math.min(loaded, groupBytes), total }),
        });
        for (const part of group) {
            const image = response.images.find((candidate) => candidate.name === part.name);
            if (!image) throw new GeneratorError("UPLOAD_INCOMPLETE", `Máy chủ không trả id cho ảnh ${part.file.name}. Vui lòng thử lại.`);
            cache.set(part.file, image.imageId);
        }
        uploadedBefore += groupBytes;
        options.onProgress?.({ loaded: uploadedBefore, total });
    }
    return resolveFromCache(attachments, cache);
}
