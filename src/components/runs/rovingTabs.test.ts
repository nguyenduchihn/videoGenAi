import { describe, expect, it } from "vitest";
import { nextTabIndex } from "./rovingTabs";

describe("nextTabIndex", () => {
    it("wraps with arrows, jumps with Home/End and ignores other keys", () => {
        expect(nextTabIndex("ArrowRight", 3, 4)).toBe(0);
        expect(nextTabIndex("ArrowLeft", 0, 4)).toBe(3);
        expect(nextTabIndex("ArrowDown", 1, 4)).toBe(2);
        expect(nextTabIndex("Home", 2, 4)).toBe(0);
        expect(nextTabIndex("End", 0, 4)).toBe(3);
        expect(nextTabIndex("Enter", 0, 4)).toBeNull();
        expect(nextTabIndex("ArrowRight", 0, 0)).toBeNull();
    });
});
