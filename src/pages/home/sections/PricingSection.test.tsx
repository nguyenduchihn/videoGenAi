import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/auth.store";
import { renderWithProviders } from "@/test/renderWithProviders";
import { PricingSection } from "./PricingSection";

afterEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearUser();
});

describe("PricingSection — bảng giá landing lấy từ /portal/pricing", () => {
    it("payg: hiện 3 gói, gói giữa 'Phổ biến', bảng chi phí credit theo chế độ và ước tính", async () => {
        renderWithProviders(<PricingSection />);
        expect(await screen.findByRole("list", { name: "Gói nạp credit" })).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
        expect(screen.getByText("Phổ biến")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Bắt đầu với gói này Pro" })).toBeEnabled();
        expect(screen.getByRole("table", { name: "Chi phí credit mỗi lượt tạo theo chế độ" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Ước tính chi phí" })).toBeInTheDocument();
        expect(screen.getByText(/Không hết hạn/)).toBeInTheDocument();
    });

    it("admin tạm tắt nạp ⇒ vẫn hiện gói nhưng nút bị khoá kèm thông báo và Liên hệ hỗ trợ", async () => {
        localStorage.setItem("videogen:mock-topup-disabled", "1");
        renderWithProviders(<PricingSection />);
        expect(await screen.findByRole("status")).toHaveTextContent("Nạp credit tạm thời chưa khả dụng");
        expect(screen.getByRole("button", { name: "Bắt đầu với gói này Pro" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Liên hệ hỗ trợ" })).toBeInTheDocument();
    });

    it("subscription: hiện các gói dịch vụ có giá, tiêu đề đổi, không có gói nạp", async () => {
        localStorage.setItem("videogen:mock-mode", "subscription");
        renderWithProviders(<PricingSection />);
        expect(await screen.findByRole("article", { name: "Gói Pro" })).toHaveTextContent("299.000");
        expect(screen.getByRole("heading", { name: /Chọn gói/ })).toBeInTheDocument();
        expect(screen.queryByRole("list", { name: "Gói nạp credit" })).toBeNull();
        expect(screen.getByText(/dùng thử 14 ngày/)).toBeInTheDocument();
    });

    it("đang tải ⇒ skeleton, không vẽ nhánh payg hay subscription", () => {
        renderWithProviders(<PricingSection />);
        expect(screen.getByLabelText("Đang tải bảng giá")).toBeInTheDocument();
        expect(screen.queryByRole("list", { name: "Gói nạp credit" })).toBeNull();
    });

    it("đã đăng nhập ⇒ CTA đổi thành 'Nạp gói này'", async () => {
        useAuthStore.setState({ user: { user: { id: "u1" } } as never });
        renderWithProviders(<PricingSection />);
        await waitFor(() => expect(screen.getByRole("button", { name: "Nạp gói này Pro" })).toBeInTheDocument());
    });
});
