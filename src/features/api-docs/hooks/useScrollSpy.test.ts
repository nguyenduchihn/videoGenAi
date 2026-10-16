import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollSpy } from "./useScrollSpy";

type Cb = (entries: Array<{ target: { id: string }; isIntersecting: boolean }>) => void;

describe("useScrollSpy", () => {
    let callback: Cb = () => undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    afterEach(() => vi.unstubAllGlobals());

    function setup() {
        vi.stubGlobal("IntersectionObserver", vi.fn(function (this: unknown, cb: Cb, opts: IntersectionObserverInit) {
            callback = cb;
            expect(opts.rootMargin).toBe("-12% 0px -76% 0px");
            return { observe, disconnect, unobserve: vi.fn() };
        }));
        for (const id of ["a", "b", "c"]) {
            const el = document.createElement("section");
            el.id = id;
            document.body.appendChild(el);
        }
    }

    it("mặc định mục đầu; mục đi vào dải theo dõi ⇒ active; nhiều mục cùng lúc ⇒ mục trước", () => {
        setup();
        const { result, unmount } = renderHook(() => useScrollSpy(["a", "b", "c"]));
        expect(result.current).toBe("a");
        expect(observe).toHaveBeenCalledTimes(3);
        act(() => callback([{ target: { id: "c" }, isIntersecting: true }]));
        expect(result.current).toBe("c");
        act(() => callback([{ target: { id: "b" }, isIntersecting: true }]));
        expect(result.current).toBe("b");
        act(() => callback([{ target: { id: "b" }, isIntersecting: false }, { target: { id: "c" }, isIntersecting: false }]));
        expect(result.current).toBe("b"); // không mục nào trong dải ⇒ giữ mục cũ
        unmount();
        expect(disconnect).toHaveBeenCalled();
    });

    it("tắt (tab Cấu hình) ⇒ không tạo observer", () => {
        setup();
        renderHook(() => useScrollSpy(["a"], false));
        expect(IntersectionObserver).not.toHaveBeenCalled();
    });
});
