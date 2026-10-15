import { expect, test } from "@playwright/test";

// Chạy trên Vite mock (MSW): register trả devToken, verify-email trả firstKey, /me trả user demo.

test("chưa đăng nhập ⇒ trang trong MainLayout chuyển về /login kèm from", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("videogen:mock-unauth", "1"));
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});

test("đăng nhập bằng email/mật khẩu ⇒ dashboard hiện tên thật", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("kullchinh@example.com");
    await page.getByPlaceholder("Nhập mật khẩu").fill("secret123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Xin chào, Kull Chính/ })).toBeVisible();
});

test("đăng ký ⇒ kiểm tra hộp thư ⇒ xác minh bằng token ⇒ dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Họ và tên").fill("Người dùng e2e");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByPlaceholder("Nhập mật khẩu").fill("matkhau123");
    await page.getByPlaceholder("Nhập lại mật khẩu").fill("matkhau123");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();
    await expect(page).toHaveURL(/\/verify-email\?email=e2e%40example\.com/);
    await expect(page.getByRole("heading", { name: "Kiểm tra hộp thư" })).toBeVisible();

    await page.getByRole("button", { name: /Gửi lại email xác minh/ }).click();
    await expect(page.getByText("Email xác minh đã được gửi lại.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Gửi lại sau \d+s/ })).toBeDisabled();

    await page.goto("/verify-email?token=dev-verify-token");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Email đã được xác minh!")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("videogen_api_key"))).toBeNull(); // web không lưu key nữa
});

test("link xác minh hết hạn ⇒ báo lỗi và cho gửi lại", async ({ page }) => {
    await page.goto("/verify-email?token=expired&email=e2e@example.com");
    await expect(page.getByRole("heading", { name: "Liên kết không hợp lệ" })).toBeVisible();
    await expect(page.getByText("Liên kết đã hết hạn.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Gửi lại email xác minh/ })).toBeEnabled();
});

test("quên mật khẩu ⇒ đặt lại ⇒ về /login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("kullchinh@example.com");
    await page.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }).click();
    await expect(page.getByRole("heading", { name: "Đã gửi!" })).toBeVisible();

    await page.goto("/reset-password?token=dev-reset-token");
    await page.getByLabel("Mật khẩu mới").fill("matkhaumoi123");
    await page.getByLabel("Xác nhận mật khẩu").fill("matkhaumoi123");
    await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/reset-password?token=expired");
    await page.getByLabel("Mật khẩu mới").fill("matkhaumoi123");
    await page.getByLabel("Xác nhận mật khẩu").fill("matkhaumoi123");
    await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
    await expect(page.getByText("Liên kết đã hết hạn.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Yêu cầu link mới" }).first()).toBeVisible();
});
