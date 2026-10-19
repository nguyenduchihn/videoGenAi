import type { GeneratorMode } from "./modes";

/** Tối đa số ảnh mỗi khung (đầu/cuối) — mỗi ảnh (cặp đầu–cuối) là một video riêng. */
export const MAX_FRAMES = 10;

export const isFrameMode = (mode: GeneratorMode): boolean => mode === "image-to-video" || mode === "start-end-image-to-video";

export interface FramePlan {
    /** Số video theo ảnh: max(số khung đầu, số khung cuối); 0/1 ⇒ không nhân bản theo ảnh. */
    frames: number;
    /** Prompt đã ghép theo ảnh: 1 prompt dùng chung ⇒ lặp N lần; N prompt ⇒ giữ nguyên. */
    jobs: string[];
    /** Số prompt không khớp số ảnh (khác 1 và khác N) ⇒ lỗi hiển thị cho khách. */
    promptMismatch: boolean;
}

/**
 * API /v1/tasks nhận MỘT ảnh cho images.start/end ⇒ nhiều ảnh khung được tách thành nhiều task:
 * ảnh thứ i ghép prompt thứ i (hoặc prompt chung) và khung cuối thứ i (hoặc khung cuối chung nếu chỉ có 1).
 */
export function planFrameJobs(mode: GeneratorMode, prompts: string[], startCount: number, endCount: number): FramePlan {
    const frames = isFrameMode(mode) ? Math.max(startCount, mode === "start-end-image-to-video" ? endCount : 0) : 0;
    if (frames <= 1 || prompts.length === 0) return { frames, jobs: prompts, promptMismatch: false };
    if (prompts.length === 1) return { frames, jobs: Array.from({ length: frames }, () => prompts[0]!), promptMismatch: false };
    return { frames, jobs: prompts, promptMismatch: prompts.length !== frames };
}

/** Ảnh dùng cho job thứ `index`: một ảnh ⇒ dùng chung cho mọi job; nhiều ảnh ⇒ ảnh cùng số thứ tự. */
export function frameAt<T>(list: readonly T[], index: number): T | undefined {
    return list.length === 1 ? list[0] : list[index];
}
