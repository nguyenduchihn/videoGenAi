import { expect, test } from "@playwright/test";

// Mock MSW: /v1/tasks tạo lô, /v1/runs/:id tóm tắt lượt tiến triển pending → processing → succeeded sau vài lần poll (3 s/lần).

test("tạo video nhanh từ dashboard bằng phiên đăng nhập (không cần API key): lượt xuất hiện tại chỗ và nhận kết quả", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();

    await page.getByPlaceholder(/Nhập prompt/).fill("Một chú mèo đang lướt sóng lúc hoàng hôn");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0); // 1 job ⇒ không hỏi xác nhận, không còn dialog "Kết nối API key"
    expect(await page.evaluate(() => localStorage.getItem("videogen_api_key"))).toBeNull();

    // Khối lượt đang chạy ngay dưới form: tiến độ + thẻ kết quả; mock chuyển sang succeeded sau ~3 lần poll ⇒ có <video>.
    const results = page.getByRole("region", { name: "Kết quả" });
    await expect(results).toBeVisible();
    await expect(results.locator("video").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("status").filter({ hasText: /1\/1 hoàn thành/ }).first()).toBeVisible();
    // 1 job ⇒ xem hết tại chỗ (không cần "Mở lượt tạo đầy đủ"); lượt vẫn có trong "Lượt tạo gần đây" với link sang trang chi tiết.
    await expect(page.getByRole("link", { name: /\/1 hoàn thành/ }).first()).toHaveAttribute("href", /\/runs\//);
});
