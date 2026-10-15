import { VIDEO_DURATIONS } from "@/features/generator/modes";
import type { VideoDuration } from "../types";
import { ChipGroup } from "./ChipGroup";

interface DurationChipsProps {
    value: VideoDuration;
    onChange: (value: VideoDuration) => void;
}

const OPTIONS = VIDEO_DURATIONS.map((seconds) => ({ value: seconds, label: `${seconds}s` }));

export function DurationChips({ value, onChange }: DurationChipsProps) {
    return <ChipGroup label="Thời lượng" options={OPTIONS} value={value} onChange={onChange} />;
}
