import { upscaleOptions, type ModeKind } from "@/features/generator/modes";
import type { UpscaleChoice } from "../types";
import { ChipGroup, type ChipOption } from "./ChipGroup";

interface UpscaleChipsProps {
    kind: ModeKind;
    value: UpscaleChoice;
    onChange: (value: UpscaleChoice) => void;
}

export function UpscaleChips({ kind, value, onChange }: UpscaleChipsProps) {
    const options: ChipOption<UpscaleChoice>[] = [
        { value: "none", label: "Không" },
        ...upscaleOptions(kind).map((resolution) => ({ value: resolution, label: resolution })),
    ];
    return <ChipGroup label="Upscale" options={options} value={value} onChange={onChange} />;
}
