import { expect, test, type Page } from "@playwright/test";

// /api-docs trên mock MSW: `videogen:mock-unauth`=1 ⇒ chưa đăng nhập; mặc định đã đăng nhập (mock /portal/auth/me).
async function open(page: Page, path = "/api-docs", flags: Record<string, string> = {}) {
    await page.goto("/");
    await page.evaluate((f) => { localStorage.clear(); for (const [k, v] of Object.entries(f)) localStorage.setItem(k, v); }, flags);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: "Tài liệu API" })).toBeVisible();
}

const noHorizontalOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test("công khai: mục lục nhảy tới mục, aria-current theo cuộn, đổi ngôn ngữ code áp cho cả trang", async ({ page, isMobile }) => {
    test.skip(isMobile, "mục lục dạng nav chỉ có trên desktop");
    await open(page, "/api-docs", { "videogen:mock-unauth": "1" });
    const toc = page.getByRole("navigation", { name: "Mục lục" });
    await toc.getByRole("link", { name: /Webhook/ }).click();
    await expect(page).toHaveURL(/#webhook$/);
    await expect(page.getByRole("heading", { level: 2, name: "Webhook" })).toBeInViewport();
    await expect(toc.getByRole("link", { name: /Webhook/ })).toHaveAttribute("aria-current", "location");

    await toc.getByRole("link", { name: /Khởi động nhanh/ }).click();
    const quick = page.locator("#khoi-dong-nhanh");
    await quick.getByRole("tab", { name: "Python" }).first().click();
    await expect(quick.getByRole("group", { name: /Bước 3.*\(Python\)/ })).toContainText("requests.post(");
    await expect(page.locator("#xac-thuc").getByRole("group", { name: /Kiểm tra key \(Python\)/ })).toContainText("requests.get(");
    expect(await noHorizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("mobile: select mục lục dính dưới header, chọn mục ⇒ cuộn tới; không tràn ngang", async ({ page, isMobile }) => {
    test.skip(!isMobile, "chỉ mobile");
    await open(page, "/api-docs", { "videogen:mock-unauth": "1" });
    await page.getByLabel("Chuyển tới mục").selectOption("loi");
    await expect(page).toHaveURL(/#loi$/);
    await expect(page.getByRole("heading", { level: 2, name: "Mã lỗi" })).toBeInViewport();
    await expect(page.getByLabel("Chuyển tới mục")).toBeInViewport();
    expect(await noHorizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("mở link sâu #models: giá credit lấy sống từ /portal/pricing", async ({ page }) => {
    await open(page, "/api-docs#models", { "videogen:mock-unauth": "1" });
    const models = page.locator("#models");
    await expect(models.getByRole("heading", { level: 2, name: "Models & giá" })).toBeInViewport();
    await expect(models.getByRole("group", { name: "Video · mỗi job" })).toContainText("Veo_3.1-Lite");
});

test("tải tài liệu: /api-docs.md và /llms.txt sinh từ cùng manifest", async ({ page }) => {
    const md = await page.request.get("/api-docs.md");
    expect(md.headers()["content-type"]).toContain("text/markdown");
    const body = await md.text();
    expect(body).toContain("# VideoGen AI API");
    expect(body).toContain("## Webhook");
    const llms = await (await page.request.get("/llms.txt")).text();
    expect(llms).toContain("https://aiveo3.org/api-docs#webhook");
});

test("tab Cấu hình khi đã đăng nhập: hiện / xoay khoá webhook (xác nhận), URL giữ ?tab=config", async ({ page }) => {
    await open(page, "/api-docs");
    await page.getByRole("tab", { name: "Cấu hình API key & Webhook" }).click();
    await expect(page).toHaveURL(/\?tab=config/);
    await page.getByRole("button", { name: "Hiện khoá" }).click();
    const secret = page.getByRole("textbox", { name: "Khoá ký webhook", exact: true });
    await expect(secret).toHaveValue(/^whsec_mock_/);
    const before = await secret.inputValue();
    await page.getByRole("button", { name: "Xoay khoá" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xoay khoá" }).click();
    await expect(secret).not.toHaveValue(before);
    await expect(page.getByRole("link", { name: /Quản lý key|Tạo key/ })).toBeVisible();
});

test("tab Cấu hình khi chưa đăng nhập: mời đăng nhập", async ({ page }) => {
    await open(page, "/api-docs?tab=config", { "videogen:mock-unauth": "1" });
    await expect(page.getByRole("heading", { name: "Đăng nhập để xem key và khoá webhook" })).toBeVisible();
});
