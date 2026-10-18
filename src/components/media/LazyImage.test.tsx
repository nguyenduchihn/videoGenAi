import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyImage } from "./LazyImage";

type IOCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
const instances: Array<{ cb: IOCallback; observed: Set<Element> }> = [];

class IOStub {
    observed = new Set<Element>();
    constructor(cb: IOCallback) { instances.push({ cb, observed: this.observed }); }
    observe(el: Element) { this.observed.add(el); }
    unobserve(el: Element) { this.observed.delete(el); }
    disconnect() { this.observed.clear(); }
}

describe("LazyImage — chỉ gắn src khi vào khung nhìn", () => {
    beforeEach(() => { instances.length = 0; vi.stubGlobal("IntersectionObserver", IOStub); });
    afterEach(() => { vi.unstubAllGlobals(); });

    it("ngoài khung: chỉ khung chờ, không có <img>; vào khung ⇒ <img> có src, tải xong hiện rõ", async () => {
        render(<LazyImage src="https://files.test/a.png" alt="Kết quả 1" />);
        expect(screen.queryByRole("img")).toBeNull();
        const wrapperOwner = instances.at(-1)!;
        const [node] = [...wrapperOwner.observed];
        expect(node).toBeTruthy();
        await act(async () => { wrapperOwner.cb([{ target: node!, isIntersecting: true }]); await Promise.resolve(); });
        const img = await screen.findByRole("img", { name: "Kết quả 1" });
        expect(img).toHaveAttribute("src", "https://files.test/a.png");
        expect(img.className).toContain("opacity-0");
        await act(async () => { img.dispatchEvent(new Event("load")); });
        expect(img.className).toContain("opacity-100");
    });

    it("không có IntersectionObserver (jsdom thuần) ⇒ tải ngay", async () => {
        vi.unstubAllGlobals();
        // @ts-expect-error jsdom không có IO
        delete globalThis.IntersectionObserver;
        render(<LazyImage src="https://files.test/b.png" alt="Kết quả 2" />);
        expect(await screen.findByRole("img", { name: "Kết quả 2" })).toHaveAttribute("src", "https://files.test/b.png");
    });
});
