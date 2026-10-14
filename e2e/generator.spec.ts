import { expect, test } from "@playwright/test";

// Mock MSW: /v1/tasks tạo lô, /v1/batches/:id tiến triển pending → processing → succeeded sau vài lần poll (3 s/lần).

test("tạo video nhanh từ dashboard bằng phiên đăng nhập (không cần API key): chạy lô và nhận kết quả", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();

    await page.getByPlaceholder(/Nhập prompt/).fill("Một chú mèo đang lướt sóng lúc hoàng hôn");
    await page.getByRole("button", { name: /^Tạo$/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0); // không còn dialog "Kết nối API key"
    expect(await page.evaluate(() => localStorage.getItem("videogen_api_key"))).toBeNull();
    // Kết quả mock: task chuyển pending → processing → succeeded sau ~3 lần poll (3 s/lần) ⇒ có <video> trong thẻ kết quả.
    await expect(page.locator("video").first()).toBeVisible({ timeout: 30_000 });
    const batches = await page.evaluate(() =>
        Object.keys(localStorage)
            .filter((key) => key.startsWith("videogenai_active_batches"))
            .map((key) => localStorage.getItem(key)),
    );
    expect(batches.every((value) => value === null || value === "[]")).toBeTruthy();
});
