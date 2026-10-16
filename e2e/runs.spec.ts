import { expect, test, type Page } from "@playwright/test";

// Mock MSW: lượt tạo trong bộ nhớ của page; `videogen:mock-big-run` = N ⇒ có sẵn lượt run_mock_big với N job đã xong (mỗi job thứ 50 lỗi).

async function login(page: Page) {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
}

test("tạo lô 45 job từ Trang chủ: dialog xác nhận, lượt xuất hiện với tiến độ, tiếp tục ở trang Lượt tạo sau khi tải lại", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page);
    const prompts = Array.from({ length: 45 }, (_, i) => `Cảnh ${i + 1}: mèo lướt sóng`).join("\n");
    await page.getByPlaceholder(/Nhập prompt/).fill(prompts);
    await expect(page.getByText("45 jobs sẵn sàng")).toBeVisible();
    await page.getByRole("button", { name: /^Tạo 45 job$/ }).click();

    const dialog = page.getByRole("dialog", { name: "Xác nhận tạo lô" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Tên lượt tạo/).fill("Lô mèo lướt sóng");
    await dialog.getByRole("button", { name: /^Tạo 45 job →$/ }).click();

    const header = page.getByRole("status").filter({ hasText: /\/45 hoàn thành/ }).first();
    await expect(header).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Lô mèo lướt sóng").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Mở lượt tạo đầy đủ/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    const openMenu = page.getByRole("button", { name: "Mở menu" });
    if (await openMenu.isVisible()) await openMenu.click(); // mobile: thanh bên trượt ra ngoài màn hình tới khi mở menu
    await page.getByRole("link", { name: "Lượt tạo", exact: true }).first().click();
    await expect(page).toHaveURL(/\/runs$/);
    await page.getByRole("link", { name: /Lô mèo lướt sóng/ }).click();
    await expect(page).toHaveURL(/\/runs\//);
    await expect(page.getByRole("status").filter({ hasText: /\/45 hoàn thành/ }).first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /Tất cả/ })).toContainText("45");
});

test("lượt 1.000 job: trang chi tiết ảo hoá (ít DOM), lọc Thất bại, thử lại hàng loạt, đổi tên", async ({ page }) => {
    await login(page);
    await page.evaluate(() => localStorage.setItem("videogen:mock-big-run", "1000"));
    await page.goto("/runs/run_mock_big");

    await expect(page.getByRole("status").filter({ hasText: /1\.000\/1\.000 hoàn thành/ }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("tab", { name: /Thất bại/ })).toContainText("20");
    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThan(120); // 1.000 job nhưng chỉ render phần nhìn thấy (+overscan)

    await page.getByRole("tab", { name: /Thất bại/ }).click();
    await expect(page.getByRole("row").first()).toContainText("Thất bại");
    await expect(page.getByRole("row").first()).toContainText("kiểm tra bảo mật"); // lỗi UNUSUAL đã dịch sang copy tiếng Việt
    await page.getByRole("button", { name: /Thử lại 20 job thất bại/ }).click();
    await expect(page.getByText(/Đã xếp hàng lại 20 job/)).toBeVisible();

    await page.getByRole("button", { name: "Đổi tên lượt tạo" }).click();
    await page.getByLabel("Tên lượt tạo").fill("Lượt đổi tên");
    await page.getByRole("button", { name: "Lưu tên" }).click();
    await expect(page.getByRole("heading", { name: "Lượt đổi tên" })).toBeVisible();
});

test("trang Lượt tạo trống có lối về Trang chủ; /projects chuyển hướng về /runs", async ({ page }) => {
    await login(page);
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/runs$/);
    await expect(page.getByText("Chưa có lượt tạo nào")).toBeVisible();
    await page.getByRole("link", { name: /Bắt đầu tạo/ }).click();
    await expect(page).toHaveURL(/\/dashboard/);
});
