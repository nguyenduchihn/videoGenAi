import type { PromptSplitMode } from "../types";

/** Chuỗi tách prompt cố định của tuỳ chọn "separator". */
export const FIXED_SEPARATOR = "====";

export const SPLIT_OPTIONS: { value: PromptSplitMode; label: string }[] = [
    { value: "newline", label: "Xuống dòng" },
    { value: "blank-line", label: "Dòng trống" },
    { value: "separator", label: FIXED_SEPARATOR },
    { value: "custom", label: "Tùy chỉnh" },
];
