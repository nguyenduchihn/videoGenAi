import { del, get, keys, set } from "idb-keyval";
import type { CreateTaskItem } from "@/types/api";

export type ManifestChunkState = "pending" | "sent" | "queued" | "failed";

export interface ManifestChunk {
    index: number;
    /** [from, to) theo runIndex. */
    from: number;
    to: number;
    state: ManifestChunkState;
    batchId?: string;
    error?: string;
}

/**
 * "Bản kê" một lượt đang gửi, lưu IndexedDB (không TTL): đóng tab giữa chừng ⇒ mở lại gửi tiếp đúng chunk còn thiếu.
 * Chỉ giữ spec task đã dựng (imageId, không giữ File) — ảnh hết hạn 24 h ⇒ gửi tiếp sẽ báo chọn lại ảnh.
 */
export interface RunManifest {
    runId: string;
    userId: string;
    name: string | null;
    createdAt: string;
    ratio: string;
    jobs: string[];
    tasks: CreateTaskItem[];
    chunks: ManifestChunk[];
}

const PREFIX = "videogen:run:";
const keyOf = (userId: string, runId: string) => `${PREFIX}${userId}:${runId}`;

/** Chia N job thành chunk ≤ size, tất cả ở trạng thái pending. */
export function planChunks(count: number, size: number): ManifestChunk[] {
    return Array.from({ length: Math.ceil(count / size) }, (_, index) => ({
        index,
        from: index * size,
        to: Math.min((index + 1) * size, count),
        state: "pending" as const,
    }));
}

export const isChunkOpen = (chunk: ManifestChunk): boolean => chunk.state === "pending" || chunk.state === "failed";

/** Số job còn chưa tới máy chủ (chưa gửi hoặc gửi lỗi). */
export const remainingJobs = (manifest: RunManifest): number =>
    manifest.chunks.filter(isChunkOpen).reduce((sum, chunk) => sum + (chunk.to - chunk.from), 0);

export async function saveManifest(manifest: RunManifest): Promise<void> {
    try {
        await set(keyOf(manifest.userId, manifest.runId), manifest);
    } catch {
        /* IndexedDB bị chặn (riêng tư) ⇒ vẫn gửi được, chỉ mất khả năng gửi tiếp sau reload */
    }
}

export async function loadManifest(userId: string, runId: string): Promise<RunManifest | null> {
    try {
        return (await get<RunManifest>(keyOf(userId, runId))) ?? null;
    } catch {
        return null;
    }
}

export async function deleteManifest(userId: string, runId: string): Promise<void> {
    try {
        await del(keyOf(userId, runId));
    } catch {
        /* bỏ qua */
    }
}

/** Mọi bản kê của khách, mới nhất trước. */
export async function listManifests(userId: string): Promise<RunManifest[]> {
    try {
        const prefix = `${PREFIX}${userId}:`;
        const all = (await keys()).filter((key): key is string => typeof key === "string" && key.startsWith(prefix));
        const manifests = await Promise.all(all.map((key) => get<RunManifest>(key)));
        return manifests
            .filter((m): m is RunManifest => m !== undefined)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
        return [];
    }
}
