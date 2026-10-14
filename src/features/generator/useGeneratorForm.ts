import { useMemo, useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    STATIC_FALLBACK,
    getCreditCost,
    getDefaultModel,
    type ModelCatalog,
} from "@/features/generator/modelCatalog";
import { useModelCatalog } from "@/hooks/useModels";
import { persistDraftPrompt, readDraftPrompt } from "@/features/projects/useProjectDrafts";
import { validateGenerator, type ValidationResult } from "@/components/generator/ultils/generatorHelpers";
import type {
    GeneratorFilesState,
    GeneratorMode,
    GeneratorSettingsState,
    PromptSplitMode,
} from "@/components/generator/types";

const EMPTY_FILES: GeneratorFilesState = {
    startFrame: [],
    endFrame: [],
    components: [],
    referenceImages: [],
    fixedImages: [],
    dynamicImages: [],
    referenceVideos: [],
    voiceAudio: [],
    batchReferences: [],
};

export interface UseGeneratorFormReturn {
    catalog: ModelCatalog;
    mode: GeneratorMode;
    aspectRatio: string;
    setAspectRatio: (v: string) => void;
    prompt: string;
    setPrompt: (v: string) => void;
    files: GeneratorFilesState;
    promptSplitMode: PromptSplitMode;
    setPromptSplitMode: (v: PromptSplitMode) => void;
    settingsOpen: boolean;
    setSettingsOpen: (v: boolean) => void;
    settings: GeneratorSettingsState;
    setSettings: Dispatch<SetStateAction<GeneratorSettingsState>>;
    jobs: string[];
    creditPerJob: number;
    estimatedCredits: number;
    validation: ValidationResult;
    showValidation: boolean;
    setShowValidation: (v: boolean) => void;
    handleFilesChange: (field: keyof GeneratorFilesState, nextFiles: File[]) => void;
    handleModeChange: (nextMode: GeneratorMode) => void;
}

export function useGeneratorForm({
    variant = "advanced",
    draftId,
}: {
    variant?: "quick" | "advanced";
    draftId?: string;
}): UseGeneratorFormReturn {
    const catalog = useModelCatalog();
    const [showValidation, setShowValidation] = useState(false);
    const [mode, setMode] = useState<GeneratorMode>("text-to-video");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [prompt, setPrompt] = useState(() => (draftId ? readDraftPrompt(draftId) : ""));
    const [files, setFiles] = useState<GeneratorFilesState>(EMPTY_FILES);
    const [promptSplitMode, setPromptSplitMode] = useState<PromptSplitMode>("newline");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<GeneratorSettingsState>({
        model: getDefaultModel(STATIC_FALLBACK, "text-to-video"),
        parallel: 8,
        batchDelay: 10,
        burstSize: 1,
        generateAudio: true,
        upscaleThreads: 1,
        customSeparator: "===",
    });

    const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!draftId) return;
        if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
        draftSaveTimerRef.current = setTimeout(() => { persistDraftPrompt(draftId, prompt); }, 500);
        return () => { if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current); };
    }, [prompt, draftId]);

    const jobs = useMemo(() => {
        const input = prompt.trim();
        if (!input) return [];
        if (variant === "quick") return [input];
        switch (promptSplitMode) {
            case "newline":
                return input.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            case "blank-line":
                return input.split(/\r?\n\s*\r?\n/).map((s) => s.trim()).filter(Boolean);
            case "separator":
                return input.split("====").map((s) => s.trim()).filter(Boolean);
            case "custom": {
                const sep = settings.customSeparator.trim();
                if (!sep) return [input];
                return input.split(sep).map((s) => s.trim()).filter(Boolean);
            }
            default: return [input];
        }
    }, [prompt, promptSplitMode, settings.customSeparator, variant]);

    const creditPerJob = getCreditCost(catalog, settings.model);
    const estimatedCredits = jobs.length * creditPerJob;
    const validation = validateGenerator(mode, jobs, files);

    const handleFilesChange = (field: keyof GeneratorFilesState, nextFiles: File[]) => {
        setFiles((cur) => ({ ...cur, [field]: nextFiles }));
    };

    const handleModeChange = (nextMode: GeneratorMode) => {
        setShowValidation(false);
        setMode(nextMode);
        setSettings((cur) => ({ ...cur, model: getDefaultModel(catalog, nextMode) }));
        setAspectRatio(nextMode === "text-to-image" || nextMode === "batch-image" ? "1:1" : "16:9");
    };

    return {
        catalog, mode, aspectRatio, setAspectRatio,
        prompt, setPrompt, files, promptSplitMode, setPromptSplitMode,
        settingsOpen, setSettingsOpen, settings, setSettings,
        jobs, creditPerJob, estimatedCredits, validation,
        showValidation, setShowValidation, handleFilesChange, handleModeChange,
    };
}
