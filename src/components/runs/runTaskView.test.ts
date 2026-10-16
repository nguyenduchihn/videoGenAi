import { describe, expect, it } from "vitest";
import { columnsFor } from "./runTaskView";

describe("columnsFor — số cột thẻ theo bề rộng (thẻ ≥ 272 px, khe 12 px)", () => {
    it.each([
        [375, 1],
        [600, 2],
        [768, 2],
        [1024, 3],
        [1290, 4], // màn 1.555 px trừ thanh bên: trước đây 3 cột thẻ to
        [1440, 5],
    ])("%d px ⇒ %d cột", (width, cols) => {
        expect(columnsFor(width, "cards")).toBe(cols);
    });

    it("chế độ hàng gọn luôn 1 cột; bề rộng 0 vẫn ≥ 1 cột", () => {
        expect(columnsFor(1600, "rows")).toBe(1);
        expect(columnsFor(0, "cards")).toBe(1);
    });
});
