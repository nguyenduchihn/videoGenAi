import { expect, test } from "@playwright/test";

// Landing công khai trên mock: /portal/pricing trả gói (payg) hoặc plans (`videogen:mock-mode`=subscription),
// `videogen:mock-topup-disabled`=1 ⇒ admin tạm tắt nạp; `videogen:mock-unauth`=1 ⇒ chưa đăng nhập.

async function openLanding(page: import("@playwright/test").Page, flags: Record<string, string> = {}) {
    await page.goto("/");
    await page.evaluate((f) => { for (const [k, v] of Object.entries(f)) localStorage.setItem(k, v); }, flags);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tạo video chuyên nghiệp");
}

test("chưa đăng nhập: hero có CTA dùng thử kèm số credit từ API, bảng giá thật 3 gói, mục API có code mẫu, FAQ có JSON-LD", async ({ page }) => {
    await openLanding(page, { "videogen:mock-unauth": "1" });
    await expect(page.getByRole("button", { name: "Dùng thử · 100 credit miễn phí" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem tài liệu API" }).first()).toHaveAttribute("href", "https://api.aiveo3.org/docs");

    const pricing = page.locator("#bang-gia");
    await expect(pricing.getByRole("list", { name: "Gói nạp credit" }).getByRole("listitem")).toHaveCount(3);
    await expect(pricing.getByText("Phổ biến")).toBeVisible();
    await expect(pricing.getByRole("button", { name: "Bắt đầu với gói này Pro" })).toBeEnabled();
    await expect(pricing.getByRole("table", { name: "Chi phí credit mỗi lượt tạo theo chế độ" })).toBeVisible();

    const api = page.locator("#api");
    await expect(api.getByRole("region", { name: "Ví dụ gọi API bằng curl" })).toContainText("/v1/tasks");
    await api.getByRole("tab", { name: "Python" }).click();
    await expect(api.getByRole("region", { name: "Ví dụ gọi API bằng Python" })).toContainText("httpx.post");

    const faqCount = await page.evaluate(() => {
        const s = document.querySelector('script[type="application/ld+json"]');
        return s ? (JSON.parse(s.textContent ?? "{}") as { mainEntity?: unknown[] }).mainEntity?.length : 0;
    });
    expect(faqCount).toBe(8);
    await expect(page.locator("#san-pham").getByRole("article", { name: "Text → Video" })).toContainText(/credit/);
});

test("admin tạm tắt nạp ⇒ bảng giá vẫn hiện gói nhưng khoá, có Liên hệ hỗ trợ", async ({ page }) => {
    await openLanding(page, { "videogen:mock-topup-disabled": "1", "videogen:mock-unauth": "1" });
    const pricing = page.locator("#bang-gia");
    await expect(pricing.getByRole("status")).toContainText("tạm thời chưa khả dụng");
    await expect(pricing.getByRole("button", { name: "Bắt đầu với gói này Pro" })).toBeDisabled();
    await expect(pricing.getByRole("button", { name: "Liên hệ hỗ trợ" })).toBeVisible();
});

test("chế độ bán gói: bảng giá landing hiện các gói dịch vụ, không hiện gói nạp", async ({ page }) => {
    await openLanding(page, { "videogen:mock-mode": "subscription", "videogen:mock-unauth": "1" });
    const pricing = page.locator("#bang-gia");
    await expect(pricing.getByRole("heading", { name: /Chọn gói/ })).toBeVisible();
    await expect(pricing.getByRole("article", { name: "Gói Pro" })).toContainText("299.000");
    await expect(pricing.getByRole("list", { name: "Gói nạp credit" })).toHaveCount(0);
});

test("đã đăng nhập: header và CTA cuối dẫn vào Dashboard; menu anchors cuộn tới đúng section", async ({ page }) => {
    await openLanding(page);
    await expect(page.getByRole("button", { name: "Vào Dashboard" }).first()).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    if (await nav.isVisible()) {
        await nav.getByRole("button", { name: "API" }).click();
        await expect(page.locator("#api")).toBeInViewport();
    } else {
        await page.getByRole("button", { name: "Mở menu" }).click();
        await page.locator("#home-drawer").getByRole("button", { name: "API" }).click();
        await expect(page.locator("#api")).toBeInViewport();
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0); // không tràn ngang
});
