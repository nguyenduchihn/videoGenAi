import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { FaqSection } from "./FaqSection";

describe("FaqSection — câu hỏi thường gặp + JSON-LD", () => {
    it("chèn JSON-LD FAQPage với đủ 8 câu và mở/đóng từng câu bằng aria-expanded", async () => {
        const { container } = renderWithProviders(<FaqSection />);
        const script = container.querySelector('script[type="application/ld+json"]');
        expect(script).not.toBeNull();
        const data = JSON.parse(script!.textContent ?? "{}") as { "@type": string; mainEntity: unknown[] };
        expect(data["@type"]).toBe("FAQPage");
        expect(data.mainEntity).toHaveLength(8);

        const first = screen.getByRole("button", { name: "Có dùng thử miễn phí không?" });
        expect(first).toHaveAttribute("aria-expanded", "true"); // câu đầu mở sẵn
        const second = screen.getByRole("button", { name: "Thanh toán bằng cách nào?" });
        fireEvent.click(second);
        expect(second).toHaveAttribute("aria-expanded", "true");
        expect(first).toHaveAttribute("aria-expanded", "false");
    });

    it("số credit tặng trong câu trả lời lấy từ API (mock: 100)", async () => {
        renderWithProviders(<FaqSection />);
        await waitFor(() => expect(screen.getByText(/nhận ngay 100 credit/)).toBeInTheDocument());
    });
});
