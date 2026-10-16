import { fireEvent, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { useAuthStore } from "@/stores/auth.store";
import { renderWithProviders } from "@/test/renderWithProviders";
import ApiDocsPage from "./ApiDocsPage";
import { SECTIONS } from "./content/sections";

const anonymous = () => server.use(http.get("/portal/auth/me", () => HttpResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })));

describe("Trang /api-docs", () => {
    beforeEach(() => useAuthStore.getState().clearUser()); // store phiên là toàn cục giữa các test

    it("công khai: h1, mục lục đủ mọi mục, tiêu đề h2 theo đúng thứ tự, link tải .md / OpenAPI / Postman", async () => {
        anonymous();
        renderWithProviders(<ApiDocsPage />, { route: "/api-docs" });
        expect(screen.getByRole("heading", { level: 1, name: "Tài liệu API" })).toBeInTheDocument();
        const toc = screen.getByRole("navigation", { name: "Mục lục" });
        expect(within(toc).getAllByRole("link")).toHaveLength(SECTIONS.length);
        expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.trim())).toEqual(SECTIONS.map((s) => s.title));
        expect(screen.getByRole("link", { name: ".md" })).toHaveAttribute("href", "/api-docs.md");
        expect(screen.getByRole("link", { name: "Postman" })).toHaveAttribute("href", "/docs/postman.json");
        expect(await screen.findByRole("link", { name: "Đăng nhập" })).toBeInTheDocument();
    });

    it("select mục lục trên mobile có đủ mục", () => {
        anonymous();
        renderWithProviders(<ApiDocsPage />, { route: "/api-docs" });
        expect(within(screen.getByLabelText("Chuyển tới mục")).getAllByRole("option")).toHaveLength(SECTIONS.length);
    });

    it("tab Cấu hình chưa đăng nhập ⇒ thẻ mời đăng nhập", async () => {
        anonymous();
        renderWithProviders(<ApiDocsPage />, { route: "/api-docs?tab=config" });
        expect(screen.getByRole("tab", { name: "Cấu hình API key & Webhook" })).toHaveAttribute("aria-selected", "true");
        expect(await screen.findByRole("heading", { name: "Đăng nhập để xem key và khoá webhook" })).toBeInTheDocument();
    });

    it("tab Cấu hình khi đăng nhập: khoá webhook che mặc định, bấm Hiện ⇒ thấy whsec_ đầy đủ", async () => {
        renderWithProviders(<ApiDocsPage />, { route: "/api-docs" });
        fireEvent.click(screen.getByRole("tab", { name: "Cấu hình API key & Webhook" }));
        const masked = await screen.findByRole<HTMLInputElement>("textbox", { name: "Khoá ký webhook (đang ẩn)" });
        expect(masked.value).toContain("•");
        fireEvent.click(screen.getByRole("button", { name: "Hiện khoá" }));
        expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Khoá ký webhook" }).value).toMatch(/^whsec_mock_/);
        expect(screen.getByRole("link", { name: /Quản lý key|Tạo key/ })).toHaveAttribute("href", "/settings/api-keys");
    });
});
