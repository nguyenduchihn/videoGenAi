import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    EMPTY_ATTACHMENTS,
    type GeneratorAttachments,
    type GeneratorMode,
    type GeneratorSettingsState,
    type PromptSplitMode,
} from "@/components/generator/types";
import { FIXED_SEPARATOR } from "@/components/generator/settings/constants";
import { useModelCatalog } from "@/hooks/useModels";
import { usePricing } from "@/hooks/usePricing";
import { useAuthStore } from "@/stores/auth.store";
import {
    getCreditCost,
    getDefaultModel,
    getModelOptions,
    isModelInCatalogFor,
    STATIC_FALLBACK,
    type ModelCatalog,
    type ModelOption,
} from "./modelCatalog";
import { defaultRatio, modeSpec, upscaleOptions, type ImageRole, type ModeSpec } from "./modes";
import type { UploadCache } from "./uploadAttachments";
import { validateGenerator, type ValidationResult } from "./validation";
import { planFrameJobs } from "./frameJobs";

const DEFAULT_MODE: GeneratorMode = "text-to-video";
const ATTACHMENT_ROLES: readonly ImageRole[] = ["start", "end", "references", "sources"];
const UPSCALE_PRICE_KEY = { video: "upscale-video", image: "upscale-image" } as const;

/** Thu hồi object URL của mọi ảnh xem trước (đổi chế độ, xoá hết). */
export function releaseAttachments(attachments: GeneratorAttachments): void {
    if (typeof URL.revokeObjectURL !== "function") return;
    for (const role of ATTACHMENT_ROLES) {
        for (const item of attachments[role]) URL.revokeObjectURL(item.previewUrl);
    }
}

export interface UseGeneratorFormReturn {
    catalog: ModelCatalog;
    mode: GeneratorMode;
    spec: ModeSpec;
    modelOptions: ModelOption[];
    aspectRatio: string;
    setAspectRatio: (value: string) => void;
    prompt: string;
    setPrompt: (value: string) => void;
    attachments: GeneratorAttachments;
    updateAttachments: (patch: Partial<GeneratorAttachments>) => void;
    uploadCache: UploadCache;
    promptSplitMode: PromptSplitMode;
    setPromptSplitMode: (value: PromptSplitMode) => void;
    settingsOpen: boolean;
    setSettingsOpen: (value: boolean) => void;
    settings: GeneratorSettingsState;
    setSettings: Dispatch<SetStateAction<GeneratorSettingsState>>;
    jobs: string[];
    creditPerJob: number;
    estimatedCredits: number;
    /** Số dư credit hiện tại (null khi chưa tải xong hồ sơ). */
    balance: number | null;
    /** Gói không trừ credit ⇒ chi phí 0, hiện lượt tạo hôm nay thay số dư. */
    chargesCredits: boolean;
    fairUse: { today: number; limit: number | null } | null;
    validation: ValidationResult;
    showValidation: boolean;
    setShowValidation: (value: boolean) => void;
    handleModeChange: (nextMode: GeneratorMode) => void;
    /** "Tiếp tục video" từ thẻ kết quả: chuyển sang extend-video với video nguồn đã chọn. */
    startExtendFrom: (mediaId: string, label: string) => void;
    /** Khôi phục bản nháp tự lưu (prompt + chế độ + tỷ lệ + cài đặt). */
    applyDraft: (draft: { prompt: string; mode: GeneratorMode; ratio: string; settings: GeneratorSettingsState }) => void;
}

export function useGeneratorForm({ variant = "advanced" }: { variant?: "quick" | "advanced" } = {}): UseGeneratorFormReturn {
    const catalog = useModelCatalog();
    const pricing = usePricing().data;
    const me = useAuthStore((state) => state.user);
    const chargesCredits = me?.plan?.chargesCredits ?? true;
    const balance = chargesCredits ? (me?.balance.raw ?? me?.user.credits ?? null) : null;
    /** Gói không trừ credit: số video trả phí hôm nay / giới hạn (null = không giới hạn). */
    const fairUse = !chargesCredits && me ? { today: me.usage.fairUseToday, limit: me.user.fairUsePerDayOverride ?? me.plan?.fairUsePerDay ?? null } : null;
    const [showValidation, setShowValidation] = useState(false);
    const [mode, setMode] = useState<GeneratorMode>(DEFAULT_MODE);
    const [aspectRatio, setAspectRatio] = useState(defaultRatio("video"));
    const [prompt, setPrompt] = useState("");
    const [attachments, setAttachments] = useState<GeneratorAttachments>(EMPTY_ATTACHMENTS);
    const [uploadCache] = useState<UploadCache>(() => new Map());
    const [promptSplitMode, setPromptSplitMode] = useState<PromptSplitMode>("newline");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<GeneratorSettingsState>({
        model: getDefaultModel(STATIC_FALLBACK, DEFAULT_MODE),
        duration: 8,
        audioEnabled: true,
        upscale: "none",
        seed: null,
        customSeparator: "===",
    });

    // Rời trang khi còn ảnh xem trước ⇒ thu hồi object URL (đổi chế độ đã thu hồi riêng).
    const attachmentsRef = useRef(attachments);
    useEffect(() => { attachmentsRef.current = attachments; }, [attachments]);
    useEffect(() => () => { releaseAttachments(attachmentsRef.current); }, []);


    const prompts = useMemo(() => {
        const input = prompt.trim();
        if (!input) return [];
        if (variant === "quick") return [input];
        switch (promptSplitMode) {
            case "newline":
                return input.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            case "blank-line":
                return input.split(/\r?\n\s*\r?\n/).map((s) => s.trim()).filter(Boolean);
            case "separator":
                return input.split(FIXED_SEPARATOR).map((s) => s.trim()).filter(Boolean);
            case "custom": {
                const sep = settings.customSeparator.trim();
                if (!sep) return [input];
                return input.split(sep).map((s) => s.trim()).filter(Boolean);
            }
            default:
                return [input];
        }
    }, [prompt, promptSplitMode, settings.customSeparator, variant]);

    // Nhiều ảnh khung đầu/cuối ⇒ mỗi ảnh một job (prompt chung hoặc ghép theo thứ tự); giá ước tính theo số job này.
    const framePlan = useMemo(
        () => planFrameJobs(mode, prompts, attachments.start.length, attachments.end.length),
        [mode, prompts, attachments.start.length, attachments.end.length],
    );
    const jobs = framePlan.jobs;

    const spec = modeSpec(mode);
    const modelOptions = useMemo(() => getModelOptions(catalog, mode), [catalog, mode]);
    const upscaleCredits = settings.upscale === "none" ? 0 : (pricing?.workers[UPSCALE_PRICE_KEY[spec.kind]]?.credits ?? 0);
    const creditPerJob = chargesCredits ? getCreditCost(catalog, settings.model) + upscaleCredits : 0;
    const estimatedCredits = jobs.length * creditPerJob;
    const validation = useMemo(
        () => validateGenerator({ mode, jobs, settings, attachments, framePlan }),
        [mode, jobs, settings, attachments, framePlan],
    );

    const updateAttachments = useCallback((patch: Partial<GeneratorAttachments>) => {
        setAttachments((current) => ({ ...current, ...patch }));
    }, []);

    const handleModeChange = useCallback((nextMode: GeneratorMode) => {
        const nextSpec = modeSpec(nextMode);
        setShowValidation(false);
        setMode(nextMode);
        if (nextSpec.kind !== spec.kind) setAspectRatio(defaultRatio(nextSpec.kind));
        setSettings((current) => ({
            ...current,
            model: isModelInCatalogFor(catalog, nextMode, current.model) ? current.model : getDefaultModel(catalog, nextMode),
            upscale: (upscaleOptions(nextSpec.kind) as string[]).includes(current.upscale) ? current.upscale : "none",
        }));
        releaseAttachments(attachments);
        setAttachments(EMPTY_ATTACHMENTS);
    }, [attachments, catalog, spec.kind]);

    const startExtendFrom = useCallback((mediaId: string, label: string) => {
        handleModeChange("extend-video");
        setAttachments({ ...EMPTY_ATTACHMENTS, sourceMediaId: mediaId, sourceLabel: label });
    }, [handleModeChange]);

    const applyDraft = useCallback((draft: { prompt: string; mode: GeneratorMode; ratio: string; settings: GeneratorSettingsState }) => {
        handleModeChange(draft.mode);
        setPrompt(draft.prompt);
        setAspectRatio(draft.ratio);
        setSettings(draft.settings);
    }, [handleModeChange]);

    return {
        catalog, mode, spec, modelOptions, aspectRatio, setAspectRatio,
        prompt, setPrompt, attachments, updateAttachments, uploadCache,
        promptSplitMode, setPromptSplitMode, settingsOpen, setSettingsOpen, settings, setSettings,
        jobs, creditPerJob, estimatedCredits, balance, chargesCredits, fairUse, validation,
        showValidation, setShowValidation, handleModeChange, startExtendFrom, applyDraft,
    };
}
