import type { Dispatch, SetStateAction } from "react";
import type { ModeSpec } from "@/features/generator/modes";
import type { UploadProgress } from "@/features/generator/uploadAttachments";
import type { ValidationResult } from "@/features/generator/validation";
import type { QueueNotice } from "@/features/generator/useBatchRunner";
import type { SessionVideo } from "../sourceVideoPicker";
import type {
    GeneratorAttachments,
    GeneratorMode,
    GeneratorResultItem,
    GeneratorSettingsState,
    PromptSplitMode,
} from "../types";

/** Props chung cho hai layout (default/project) — GeneratorPanel nối với form + runner. */
export interface GeneratorLayoutProps {
    variant: "quick" | "advanced";
    mode: GeneratorMode;
    spec: ModeSpec;
    aspectRatio: string;
    setAspectRatio: (value: string) => void;
    handleModeChange: (mode: GeneratorMode) => void;
    setSettingsOpen: (open: boolean) => void;
    settings: GeneratorSettingsState;
    setSettings: Dispatch<SetStateAction<GeneratorSettingsState>>;
    prompt: string;
    setPrompt: (value: string) => void;
    promptSplitMode: PromptSplitMode;
    setPromptSplitMode: (value: PromptSplitMode) => void;
    jobs: string[];
    attachments: GeneratorAttachments;
    updateAttachments: (patch: Partial<GeneratorAttachments>) => void;
    sessionVideos: SessionVideo[];
    showValidation: boolean;
    validation: ValidationResult;
    submitError: string | null;
    estimatedCredits: number;
    balance: number | null;
    isGenerating: boolean;
    uploadProgress: UploadProgress | null;
    handleGenerate: () => void;
    results: GeneratorResultItem[];
    queueNotice: QueueNotice | null;
    handleRetry: (result: GeneratorResultItem) => void;
    handleDownload: (result: GeneratorResultItem) => void;
    handleCancel: (result: GeneratorResultItem) => void;
    handleCancelAll: () => void;
    handleExtend: (result: GeneratorResultItem) => void;
}
