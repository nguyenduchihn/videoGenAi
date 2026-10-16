import { expect, test, type Page } from "@playwright/test";

// Mock MSW: localStorage `videogen:mock-mode` = "subscription" ⇒ hệ thống bán gói dịch vụ (nạp credit tắt, /pricing hiện gói, /billing ⇒ /my-plan);
// lệnh mua gói chuyển "paid" ở lần poll thứ 3 (5 s/lần) ⇒ /portal/auth/me phản ánh gói + hạn mới. `videogen:mock-plan-expired` = "1" ⇒ gói đã hết hạn.

async function enableSubscription(page: Page, opts: { expired?: boolean } = {}) {
    await page.goto("/");
    await page.evaluate((expired) => {
        localStorage.setItem("videogen:mock-mode", "subscription");
        if (expired) localStorage.setItem("videogen:mock-plan-expired", "1");
    }, opts.expired ?? false);
}

test("chế độ bán gói: trang giá công khai hiện các gói có giá, không hiện gói nạp; chưa đăng nhập bấm Mua gói ⇒ về đăng nhập kèm from", async ({ page }) => {
    await enableSubscription(page);
    await page.evaluate(() => localStorage.setItem("videogen:mock-unauth", "1"));
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Chọn gói phù hợp" })).toBeVisible();
    await expect(page.getByRole("article", { name: "Gói Pro" })).toContainText("299.000");
    await expect(page.getByRole("article", { name: "Gói Unlimited" })).toContainText("Không trừ credit · tối đa 300 video/ngày");
    await expect(page.getByText("Gói credits")).toHaveCount(0);
    await page.getByRole("article", { name: "Gói Pro" }).getByRole("button", { name: "Mua gói" }).click();
    await expect(page).toHaveURL(/\/login\?from=%2Fmy-plan%3Fbuy%3Dpro/);
});

test("mua gói: thanh bên có 'Gói của tôi', /billing chuyển về /my-plan, chọn Unlimited ⇒ QR ⇒ đã thanh toán ⇒ gói hiện tại đổi và còn 30 ngày", async ({ page }) => {
    test.setTimeout(60_000);
    await enableSubscription(page);
    await page.goto("/billing");
    await expect(page).toHaveURL(/\/my-plan/);
    await expect(page.getByRole("heading", { name: "Gói của tôi" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Gói của tôi" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nạp credits" })).toHaveCount(0);

    await page.getByRole("tab", { name: "Mua / Gia hạn" }).click();
    const group = page.getByRole("radiogroup", { name: "Chọn gói dịch vụ" });
    await group.getByRole("radio", { name: /Unlimited/ }).click();
    await expect(group.getByRole("radio", { name: /Unlimited/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText(/Có hiệu lực ngay sau khi thanh toán/)).toBeVisible();
    await page.getByRole("button", { name: "Tiếp tục thanh toán" }).click();

    await expect(page.getByRole("img", { name: /Mã QR thanh toán Unlimited/ })).toBeVisible();
    await expect(page.getByText("Đã kích hoạt gói Unlimited")).toBeVisible({ timeout: 25_000 });
    await expect(page.getByRole("tab", { name: "Gói hiện tại", selected: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Gói hiện tại" })).toContainText("Unlimited");
    await expect(page.getByRole("region", { name: "Gói hiện tại" })).toContainText(/Còn 30 ngày/);
    await expect(page.getByRole("region", { name: "Gói hiện tại" })).toContainText(/Lượt tạo video hôm nay/);
});

test("gói hết hạn: trang Gói của tôi hiện cảnh báo + Gia hạn ngay; trang chủ hiện hạn gói thay số dư khi gói không trừ credit", async ({ page }) => {
    await enableSubscription(page, { expired: true });
    await page.goto("/my-plan");
    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Gói của bạn đã hết hạn");
    await alert.getByRole("button", { name: "Gia hạn ngay" }).click();
    await expect(page.getByRole("tab", { name: "Mua / Gia hạn", selected: true })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Pro.*gói của bạn/ })).toHaveAttribute("aria-checked", "true");

    await page.goto("/dashboard");
    await expect(page.getByText("Gói hiện tại")).toBeVisible();
    await expect(page.getByText(/Hết hạn .* ngày trước/).first()).toBeVisible();
});
