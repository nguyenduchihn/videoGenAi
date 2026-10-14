import type { GeneratorMode, PromptSplitMode } from "../types";
import type { ModelOption } from "@/features/generator/modelCatalog";

export const IMAGE_MODES: GeneratorMode[] = [
    "text-to-image",
    "batch-image",
];

export const MODEL_OPTIONS: Record<"video" | "image", ModelOption[]> = {
    video: [
        {
            value: "Veo_3.1-Lite",
            label: "Veo 3.1 - Lite",
            description: "Tạo video nhanh, tối ưu chi phí",
            credits: "5 credits",
        },
    ],
    image: [
        {
            value: "Nano_Banana_2_Lite",
            label: "Nano Banana 2 Lite",
            description: "Tạo ảnh nhanh với chất lượng cao",
            credits: "1 credit",
        },
    ],
};

export const SPLIT_OPTIONS: { value: PromptSplitMode; label: string }[] = [
    { value: "newline", label: "Xuống dòng" },
    { value: "blank-line", label: "Dòng trống" },
    { value: "separator", label: "====" },
    { value: "custom", label: "Tùy chỉnh" },
];

export interface NumberFieldSpec {
    key: "parallel" | "batchDelay" | "burstSize" | "upscaleThreads";
    label: string;
    labelImage?: string;
    description: string;
    min: number;
    max: number;
    step: number;
    suffix: string;
}

export const NUMBER_FIELD_SPECS: NumberFieldSpec[] = [
    {
        key: "parallel",
        label: "Số lượng song song",
        description: "Số job được xử lý cùng lúc.",
        min: 1,
        max: 32,
        step: 1,
        suffix: "luồng",
    },
    {
        key: "batchDelay",
        label: "Nghỉ sau mỗi đợt",
        description: "Thời gian chờ giữa các đợt xử lý.",
        min: 0,
        max: 300,
        step: 1,
        suffix: "giây",
    },
    {
        key: "burstSize",
        label: "Số video mỗi đợt",
        labelImage: "Số ảnh mỗi đợt",
        description: "Số lượng job được gửi trong một đợt.",
        min: 1,
        max: 100,
        step: 1,
        suffix: "job",
    },
    {
        key: "upscaleThreads",
        label: "Luồng Upscale ảnh",
        description: "Số luồng dùng để xử lý upscale.",
        min: 1,
        max: 16,
        step: 1,
        suffix: "luồng",
    },
];
