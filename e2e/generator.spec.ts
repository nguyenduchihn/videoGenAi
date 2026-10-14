import { expect, test } from "@playwright/test";

// Mock MSW: /v1/tasks tạo lô, /v1/batches/:id tiến triển pending → processing → succeeded sau vài lần poll (3 s/lần).

test("tạo video nhanh từ dashboard: chưa có key ⇒ dialog kết nối ⇒ tạo key ⇒ chạy lô và nhận kết quả", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();

    await page.getByPlaceholder(/Nhập prompt/).fill("Một chú mèo đang lướt sóng lúc hoàng hôn");
    await page.getByRole("button", { name: /^Tạo$/ }).click();

    const dialog = page.getByRole("dialog", { name: "Kết nối API key" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Tạo key mới" }).click();
    await expect(page.getByText("Đã kết nối API key")).toBeVisible();
    await expect(dialog).toBeHidden();
    const stored = await page.evaluate(() => localStorage.getItem("videogen_api_key"));
    expect(stored).toContain("vk_mock_new_key_raw");

    await page.getByRole("button", { name: /^Tạo$/ }).click();
    // Kết quả mock: task chuyển pending → processing → succeeded sau ~3 lần poll (3 s/lần) ⇒ có <video> trong thẻ kết quả.
    await expect(page.locator("video").first()).toBeVisible({ timeout: 30_000 });
    const batches = await page.evaluate(() => localStorage.getItem("videogenai_active_batches"));
    expect(batches === null || batches === "[]").toBeTruthy();
});
