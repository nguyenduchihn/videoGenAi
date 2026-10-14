import { expect, test } from "@playwright/test";

// Mock MSW: create-intent trả lệnh pending; status chuyển "paid" ở lần poll thứ 3 (5 s/lần).

test("nạp credits: chọn gói ⇒ QR + thông tin chuyển khoản ⇒ poll ⇒ đã thanh toán ⇒ chuyển tab lịch sử", async ({ page }) => {
    await page.goto("/billing");
    await expect(page.getByRole("heading", { name: "Nạp credits" })).toBeVisible();

    const group = page.getByRole("radiogroup", { name: "Chọn gói nạp" });
    await group.getByRole("radio", { name: /Pro/ }).click();
    await expect(group.getByRole("radio", { name: /Pro/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Tiếp tục thanh toán" }).click();

    await expect(page.getByRole("img", { name: /Mã QR thanh toán Pro/ })).toBeVisible();
    await expect(page.getByText("Đang chờ thanh toán…")).toBeVisible();
    await expect(page.getByText(/^VGAI\d+$/)).toBeVisible();

    await expect(page.getByText(/Nạp thành công/)).toBeVisible({ timeout: 25_000 });
    await expect(page).toHaveURL(/tab=history/);
    await expect(page.getByText("Đã thanh toán").first()).toBeVisible();
});

test("tab=ledger hiện sao kê với nhãn tiếng Việt và dấu +/−", async ({ page }) => {
    await page.goto("/billing?tab=ledger");
    await expect(page.getByText("Thưởng đăng ký")).toBeVisible();
    await expect(page.getByText("+100")).toBeVisible();
    await expect(page.getByText("-5")).toBeVisible();
    await expect(page.getByRole("link", { name: "Xem tác vụ" })).toHaveAttribute("href", /\/tasks\?id=task_demo_001/);
});

test("?package= chọn sẵn gói từ trang bảng giá", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: "Chọn gói" }).nth(2).click();
    await expect(page).toHaveURL(/\/billing\?package=business/);
    await expect(page.getByRole("radio", { name: /Business/ })).toHaveAttribute("aria-checked", "true");
});
