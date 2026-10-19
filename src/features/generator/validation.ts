import type { AttachedImage, GeneratorAttachments, GeneratorSettingsState } from "@/components/generator/types";
import { toLabel } from "./modelCatalog";
import {
    extractMentions,
    IMAGE_HANDLE_RE,
    MAX_PROMPT_LENGTH,
    MAX_SOURCES,
    maxReferences,
    modeSpec,
    LOW_PRIORITY_DURATION,
    LOW_PRIORITY_MODEL,
    OMNI_MODEL,
    SEED_MAX,
    SEED_MIN,
    type GeneratorMode,
    type ModeSpec,
} from "./modes";
import { MAX_FRAMES, type FramePlan } from "./frameJobs";

export type ValidationField =
    | "prompt"
    | "start"
    | "end"
    | "references"
    | "sources"
    | "model"
    | "handle"
    | "voice"
    | "seed";

export interface ValidationResult {
    valid: boolean;
    message?: string;
    field?: ValidationField;
}

export interface ValidationInput {
    mode: GeneratorMode;
    jobs: string[];
    settings: GeneratorSettingsState;
    attachments: GeneratorAttachments;
    /** Kế hoạch ghép ảnh khung ↔ prompt (useGeneratorForm); thiếu ⇒ bỏ qua kiểm tra nhiều khung. */
    framePlan?: FramePlan;
}

const OK: ValidationResult = { valid: true };
const fail = (message: string, field: ValidationField): ValidationResult => ({ valid: false, message, field });

/** Phản chiếu luật của backend (create-batch.use-case.ts) để khách thấy lỗi trước khi gửi. */
export function validateGenerator({ mode, jobs, settings, attachments, framePlan }: ValidationInput): ValidationResult {
    if (jobs.length === 0) return fail("Vui lòng nhập prompt.", "prompt");
    const longIndex = jobs.findIndex((job) => job.length > MAX_PROMPT_LENGTH);
    if (longIndex >= 0) return fail(`Prompt #${longIndex + 1} dài quá ${MAX_PROMPT_LENGTH} ký tự.`, "prompt");

    const spec = modeSpec(mode);
    const roleError = validateRoles(spec, settings.model, attachments);
    if (roleError) return roleError;

    if (spec.settings.duration && settings.model === LOW_PRIORITY_MODEL && settings.duration !== LOW_PRIORITY_DURATION) {
        return fail(`Veo 3.1 Lite [Lower Priority] chỉ tạo video ${LOW_PRIORITY_DURATION} giây — chọn ${LOW_PRIORITY_DURATION}s hoặc đổi model.`, "model");
    }
    const frameError = validateFrames(mode, attachments, framePlan);
    if (frameError) return frameError;

    if (mode === "start-end-image-to-video" && settings.model === OMNI_MODEL) {
        return fail("Veo 3.1 Omni không hỗ trợ Khung đầu + cuối. Chọn Lite, Fast hoặc Quality.", "model");
    }

    const handleError = validateHandles(
        [...attachments.start, ...attachments.end, ...attachments.references, ...attachments.sources],
        jobs,
    );
    if (handleError) return handleError;

    if (spec.roles.voice && attachments.voice && !settings.audioEnabled) {
        return fail("Đã chọn giọng nói nhưng audio đang tắt — bật audio hoặc bỏ chọn giọng.", "voice");
    }
    if (spec.settings.seed && settings.seed !== null && (settings.seed < SEED_MIN || settings.seed > SEED_MAX)) {
        return fail(`Seed phải từ ${SEED_MIN} đến ${SEED_MAX}.`, "seed");
    }
    return OK;
}

function validateRoles(spec: ModeSpec, model: string, attachments: GeneratorAttachments): ValidationResult | null {
    if (spec.roles.start && attachments.start.length === 0) return fail("Vui lòng chọn ảnh Khung đầu.", "start");
    if (spec.roles.end && attachments.end.length === 0) return fail("Vui lòng chọn ảnh Khung cuối.", "end");
    if (spec.roles.references) {
        const count = attachments.references.length;
        if (count === 0) return fail("Vui lòng chọn ít nhất 1 ảnh tham chiếu.", "references");
        const max = maxReferences(model);
        if (count > max) return fail(referenceLimitMessage(model, max, count), "references");
    }
    if (spec.roles.sources) {
        const count = attachments.sources.length;
        if (count === 0) return fail("Vui lòng chọn ít nhất 1 ảnh nguồn.", "sources");
        if (count > MAX_SOURCES) return fail(`Tối đa ${MAX_SOURCES} ảnh nguồn (đang chọn ${count}).`, "sources");
    }
    return null;
}

function validateFrames(mode: GeneratorMode, attachments: GeneratorAttachments, plan: FramePlan | undefined): ValidationResult | null {
    const start = attachments.start.length;
    const end = attachments.end.length;
    if (start > MAX_FRAMES) return fail(`Tối đa ${MAX_FRAMES} ảnh Khung đầu (đang chọn ${start}).`, "start");
    if (end > MAX_FRAMES) return fail(`Tối đa ${MAX_FRAMES} ảnh Khung cuối (đang chọn ${end}).`, "end");
    if (mode === "start-end-image-to-video" && start > 1 && end > 1 && start !== end) {
        return fail(`Số ảnh Khung đầu (${start}) và Khung cuối (${end}) phải bằng nhau, hoặc một bên chỉ 1 ảnh dùng chung.`, "end");
    }
    if (plan?.promptMismatch) {
        return fail(`Có ${plan.frames} ảnh nên mỗi ảnh là một video: nhập 1 prompt dùng chung hoặc đúng ${plan.frames} prompt theo thứ tự ảnh (đang có ${plan.jobs.length}).`, "prompt");
    }
    return null;
}

function referenceLimitMessage(model: string, max: number, count: number): string {
    const base = `Model ${toLabel(model)} chỉ nhận tối đa ${max} ảnh tham chiếu (đang chọn ${count}).`;
    return model === OMNI_MODEL ? base : `${base} Chọn Veo 3.1 Omni để dùng tới ${maxReferences(OMNI_MODEL)} ảnh.`;
}

function validateHandles(items: AttachedImage[], jobs: string[]): ValidationResult | null {
    const handles = items.map((item) => item.handle.trim()).filter(Boolean);
    const malformed = handles.find((handle) => !IMAGE_HANDLE_RE.test(handle));
    if (malformed !== undefined) {
        return fail(`Tên ảnh @${malformed} không hợp lệ: chữ thường, số, _ hoặc -, bắt đầu bằng chữ, tối đa 30 ký tự.`, "handle");
    }
    const duplicate = handles.find((handle, index) => handles.indexOf(handle) !== index);
    if (duplicate !== undefined) return fail(`Tên ảnh @${duplicate} bị trùng.`, "handle");

    const bound = new Set(handles);
    for (const [index, job] of jobs.entries()) {
        const missing = extractMentions(job).find((mention) => !bound.has(mention));
        if (missing !== undefined) {
            return fail(`Prompt #${index + 1} nhắc @${missing} nhưng chưa có ảnh nào đặt tên @${missing}.`, "prompt");
        }
    }
    return null;
}
