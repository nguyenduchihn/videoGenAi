import { describe, expect, it } from "vitest";
import { NUMBER_FIELD_SPECS, SPLIT_OPTIONS } from "./constants";
import type { PromptSplitMode } from "../types";

describe("NUMBER_FIELD_SPECS", () => {
    it("has 4 entries", () => {
        expect(NUMBER_FIELD_SPECS).toHaveLength(4);
    });

    it("has min <= max for all entries", () => {
        for (const spec of NUMBER_FIELD_SPECS) {
            expect(spec.min).toBeLessThanOrEqual(spec.max);
        }
    });
});

describe("SPLIT_OPTIONS", () => {
    it("values match PromptSplitMode", () => {
        const values = SPLIT_OPTIONS.map((o) => o.value) satisfies PromptSplitMode[];
        expect(values).toHaveLength(4);
    });
});
