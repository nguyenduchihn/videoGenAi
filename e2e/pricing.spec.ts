import { expect, test } from "@playwright/test";

// /pricing là trang công khai: chưa đăng nhập vẫn phải thấy bảng giá + gói nạp (lấy từ /portal/pricing, không gọi endpoint cần phiên).

test("chưa đăng nhập vẫn xem được bảng giá và các gói nạp, không báo lỗi", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("videogen:mock-unauth", "1"));
    await page.goto("/pricing");
    await expect(page.getByText("Không thể tải thông tin bảng giá")).toHaveCount(0);
    await expect(page.getByText(/Starter/).first()).toBeVisible();
    await expect(page.getByText(/Pro/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nạp credits" })).toBeVisible(); // thanh điều hướng riêng của trang công khai
    await expect(page.getByText("Nạp credits hiện đang tạm thời không khả dụng")).toHaveCount(0);
});

test("admin tạm tắt nạp tiền ⇒ trang giá vẫn hiện gói kèm thông báo, nút chọn gói bị khoá", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("videogen:mock-topup-disabled", "1"));
    await page.goto("/pricing");
    await expect(page.getByText("Nạp credits hiện đang tạm thời không khả dụng")).toBeVisible();
    await expect(page.getByText(/Starter/).first()).toBeVisible();
});
