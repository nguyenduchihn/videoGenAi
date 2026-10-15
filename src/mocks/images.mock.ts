import type { UploadedImage } from "@/types/api";

const TTL_MS = 24 * 60 * 60 * 1_000;
const seen = new Map<string, string>();
let sequence = 0;

/**
 * Mô phỏng POST /v1/images. Backend thật dedup theo sha256 nội dung; mock xấp xỉ bằng tên + cỡ file
 * (không đọc nội dung) ⇒ test cần dedup chính xác theo nội dung phải chạy trên backend thật.
 */
export function mockUploadedImage(name: string, file: File): UploadedImage {
    const key = `${file.name}:${file.size}`;
    const existing = seen.get(key);
    sequence += 1;
    const imageId = existing ?? `img_mock_${sequence.toString(36)}`;
    if (!existing) seen.set(key, imageId);
    const now = Date.now();
    return {
        imageId,
        name,
        filename: file.name || null,
        duplicateOf: existing ?? null,
        mime: file.type || "image/png",
        size: file.size,
        sha256: key,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + TTL_MS).toISOString(),
    };
}

export function resetMockImages(): void {
    seen.clear();
    sequence = 0;
}
