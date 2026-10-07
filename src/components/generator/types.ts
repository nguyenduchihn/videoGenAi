export type GeneratorMode =
    | "text-to-video"
    | "image-to-video"
    | "components"
    | "text-to-image"
    | "batch-image"
    | "reference-video-voice"
    | "batch-reference";

export type PromptSplitMode =
    | "newline"
    | "blank-line"
    | "separator"
    | "custom";

export interface GeneratorSettingsState {
    model: string;
    parallel: number;
    batchDelay: number;
    burstSize: number;
    generateAudio: boolean;
    upscaleThreads: number;
    customSeparator: string;
}

export interface GeneratorFilesState {
    startFrame: File[];
    endFrame: File[];

    components: File[];

    referenceImages: File[];

    fixedImages: File[];
    dynamicImages: File[];

    referenceVideos: File[];
    voiceAudio: File[];

    batchReferences: File[];
}