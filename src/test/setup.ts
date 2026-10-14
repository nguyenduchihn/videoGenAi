import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/mocks/server";

// Mọi test chạy trên backend giả MSW; request không khai báo ⇒ lỗi để lộ thiếu handler.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
    server.resetHandlers();
    cleanup();
    localStorage.clear();
});
afterAll(() => server.close());

// jsdom thiếu vài API trình duyệt mà UI dùng.
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
window.scrollTo = (() => undefined) as typeof window.scrollTo;
window.matchMedia ??= ((query: string) =>
    ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
