import { expect, test } from "@playwright/test";

test("lịch sử tác vụ: lọc theo trạng thái, mở chi tiết, huỷ tác vụ đang xử lý", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.getByRole("heading", { name: "Lịch sử tác vụ" })).toBeVisible();
    await expect(page.getByText("Văn bản → Video").first()).toBeVisible();

    await page.getByRole("tab", { name: "Đang xử lý" }).click();
    await expect(page).toHaveURL(/status=processing/);
    await expect(page.getByText("Ảnh → Video").first()).toBeVisible();

    await page.getByRole("button", { name: "Chi tiết" }).first().click();
    await expect(page).toHaveURL(/id=task_demo_002/);
    const sheet = page.getByRole("dialog", { name: "Chi tiết tác vụ" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("task_demo_002")).toBeVisible();

    await sheet.getByRole("button", { name: "Huỷ tác vụ" }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "Huỷ tác vụ" }).click();
    await expect(page.getByText("Đã huỷ tác vụ.")).toBeVisible();
});

test("dashboard liên kết sang lịch sử và chi tiết tác vụ", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Xem tất cả" }).click();
    await expect(page).toHaveURL(/\/tasks$/);
});
