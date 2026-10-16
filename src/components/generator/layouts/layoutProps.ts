import type { Dispatch, SetStateAction } from "react";
import type { ModeSpec } from "@/features/generator/modes";
import type { UploadProgress } from "@/features/generator/uploadAttachments";
import type { ValidationResult } from "@/features/generator/validation";
import type { SessionVideo } from "../sourceVideoPicker";
import type { GeneratorAttachments, GeneratorMode, GeneratorSettingsState, PromptSplitMode } from "../types";

/** Props của layout trình tạo (form) — GeneratorPanel nối với form; kết quả hiển thị ở khối lượt tạo bên ngoài. */
export interface GeneratorLayoutProps {
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
    /** Tiến độ gửi lô (đã gửi/tổng) khi lượt nhiều chunk. */
    sendProgress: { sent: number; total: number } | null;
    handleGenerate: () => void;
}
