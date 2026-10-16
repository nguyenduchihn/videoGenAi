import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ApiSection } from "./ApiSection";
import { API_SAMPLES } from "./apiSamples";

describe("ApiSection — code mẫu đúng API, tab và sao chép", () => {
    it("mặc định hiện curl với POST /v1/tasks, X-API-Key và Idempotency-Key", () => {
        renderWithProviders(<ApiSection />);
        const region = screen.getByRole("region", { name: "Ví dụ gọi API bằng curl" });
        expect(region).toHaveTextContent("/v1/tasks");
        expect(region).toHaveTextContent("X-API-Key");
        expect(region).toHaveTextContent("Idempotency-Key");
        expect(region).toHaveTextContent("webhookUrl");
    });

    it("chuyển tab Node.js bằng chuột và Python bằng phím mũi tên", () => {
        renderWithProviders(<ApiSection />);
        fireEvent.click(screen.getByRole("tab", { name: "Node.js" }));
        expect(screen.getByRole("region", { name: "Ví dụ gọi API bằng Node.js" })).toHaveTextContent("crypto.randomUUID()");
        fireEvent.keyDown(screen.getByRole("tab", { name: "Node.js" }), { key: "ArrowRight" });
        expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("region", { name: "Ví dụ gọi API bằng Python" })).toHaveTextContent("httpx.post");
    });

    it("nút Sao chép ghi đúng mã của tab đang chọn vào clipboard", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        renderWithProviders(<ApiSection />);
        fireEvent.click(screen.getByRole("button", { name: "Sao chép" }));
        expect(writeText).toHaveBeenCalledWith(API_SAMPLES[0]!.code);
        expect(await screen.findByRole("button", { name: "Đã sao chép" })).toBeInTheDocument();
    });

    it("mọi mẫu đều trỏ tới api.aiveo3.org và dùng mảng tasks (hình dạng API thật)", () => {
        for (const s of API_SAMPLES) {
            expect(s.code).toContain("https://api.aiveo3.org/v1/tasks");
            expect(s.code).toMatch(/"?tasks"?\s*[:=]/);
            expect(s.code).toContain("webhookUrl");
        }
    });
});
