import { describe, expect, it } from "vitest";
import { SPLIT_OPTIONS } from "./constants";
import type { PromptSplitMode } from "../types";

describe("SPLIT_OPTIONS", () => {
    it("values match PromptSplitMode", () => {
        const values = SPLIT_OPTIONS.map((o) => o.value) satisfies PromptSplitMode[];
        expect(values).toHaveLength(4);
    });
});
