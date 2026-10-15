import { expect, test, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Mock MSW (VITE_USE_MOCK_API=true): /v1/images trả id theo tên field, /v1/tasks kiểm ảnh theo worker rồi
// lô chuyển pending → processing → succeeded sau vài lần poll (3 s/lần); thân request được ghi vào localStorage.
const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

type TaskRequest = { tasks: Array<{ worker: string; params: Record<string, unknown>; images?: Record<string, unknown>; sourceMediaId?: string; upscale?: { resolution: string } }> };

async function sentRequests(page: Page): Promise<TaskRequest[]> {
    return page.evaluate(() => JSON.parse(localStorage.getItem("videogen:mock-task-requests") ?? "[]") as TaskRequest[]);
}

async function chooseMode(page: Page, label: RegExp) {
    await page.getByRole("button", { name: /^Chế độ/ }).click();
    await page.getByRole("option", { name: label }).click();
}

const slotInput = (page: Page, label: RegExp) => page.getByRole("region", { name: label }).locator('input[type="file"]');
/** Chỉ đếm media trong khu Kết quả (bộ chọn video nguồn cũng render <video>). */
const resultVideos = (page: Page) => page.getByRole("region", { name: "Kết quả" }).locator("video");

// Mỗi lô mock cần ~9–12 s poll; test có 2 lô cần hơn 30 s mặc định.
test.describe.configure({ timeout: 60_000 });

test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    await page.evaluate(() => localStorage.removeItem("videogen:mock-task-requests"));
});

test("Khung đầu → Video: tải 1 ảnh, gửi đúng worker image-to-video + images.start, nhận video", async ({ page }) => {
    await chooseMode(page, /Khung đầu → Video/);
    await slotInput(page, /^Khung đầu/).setInputFiles(fixture("a.png"));
    await expect(page.getByRole("region", { name: /^Khung đầu/ }).getByRole("img")).toBeVisible();
    await page.getByPlaceholder(/Nhập prompt/).fill("Camera lướt qua bãi biển");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();

    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    const [request] = await sentRequests(page);
    expect(request?.tasks[0]).toMatchObject({ worker: "image-to-video", images: { start: expect.stringMatching(/^img_mock_/) }, params: { audioEnabled: true, duration: 8 } });
});

test("Khung đầu + cuối → Video: thiếu khung cuối bị chặn tại chỗ, đủ 2 ảnh gửi start-end-image-to-video", async ({ page }) => {
    await chooseMode(page, /Khung đầu \+ cuối → Video/);
    await page.getByPlaceholder(/Nhập prompt/).fill("Chuyển cảnh từ ngày sang đêm");
    await slotInput(page, /^Khung đầu/).setInputFiles(fixture("a.png"));
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(page.getByRole("alert")).toContainText("Vui lòng chọn ảnh Khung cuối.");

    await slotInput(page, /^Khung cuối/).setInputFiles(fixture("b.png"));
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    const [request] = await sentRequests(page);
    expect(request?.tasks[0]).toMatchObject({ worker: "start-end-image-to-video", images: { start: expect.any(String), end: expect.any(String) } });
});

test("Ảnh tham chiếu → Video: tối đa 3 ảnh, @tên trong prompt, giọng nói; mention không gắn ảnh bị chặn", async ({ page }) => {
    await chooseMode(page, /Ảnh tham chiếu → Video/);
    const region = page.getByRole("region", { name: /^Ảnh tham chiếu/ });
    await expect(region.getByText("Tối đa 3 ảnh", { exact: true })).toBeVisible();
    await slotInput(page, /^Ảnh tham chiếu/).setInputFiles([fixture("a.png"), fixture("b.png"), fixture("c.png"), fixture("d.png")]);
    await expect(region.getByRole("alert")).toContainText("Chỉ chọn tối đa 3 ảnh.");
    await expect(region.getByRole("img")).toHaveCount(3);

    await region.getByLabel("Tên ảnh để nhắc trong prompt").first().fill("girl");
    await page.getByLabel(/Giọng nói/).fill("giọng nữ trung, nhẹ nhàng");
    await page.getByPlaceholder(/Nhập prompt/).fill("@girl và @boy đi dạo trong công viên");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(page.getByRole("alert").last()).toContainText("nhắc @boy nhưng chưa có ảnh nào đặt tên @boy");

    await page.getByPlaceholder(/Nhập prompt/).fill("@girl đi dạo trong công viên");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    const [request] = await sentRequests(page);
    expect(request?.tasks[0]).toMatchObject({
        worker: "reference-images-to-video",
        params: { audio: "giọng nữ trung, nhẹ nhàng" },
        images: { references: [{ imageId: expect.any(String), handle: "girl" }, expect.any(String), expect.any(String)] },
    });
});

test("Ảnh tham chiếu → Ảnh: 2 ảnh nguồn gửi image-to-image với images.sources và nhận ảnh", async ({ page }) => {
    await chooseMode(page, /Ảnh tham chiếu → Ảnh/);
    await slotInput(page, /^Ảnh nguồn/).setInputFiles([fixture("a.png"), fixture("b.png")]);
    await page.getByPlaceholder(/Nhập prompt/).fill("Cô gái trong quán cà phê");
    await page.getByRole("button", { name: /^Tạo ảnh$/ }).click();

    await expect(page.getByRole("img", { name: /Kết quả #1/ })).toBeVisible({ timeout: 30_000 });
    const [request] = await sentRequests(page);
    expect(request?.tasks[0]).toMatchObject({ worker: "image-to-image", images: { sources: [expect.any(String), expect.any(String)] }, params: { ratio: "1:1" } });
});

test("Văn bản → Ảnh với upscale 2K: gửi text-to-image + upscale.resolution", async ({ page }) => {
    await chooseMode(page, /Văn bản → Ảnh/);
    await page.getByRole("radio", { name: "2K" }).click();
    await page.getByPlaceholder(/Nhập prompt/).fill("Một chú mèo đeo kính");
    await page.getByRole("button", { name: /^Tạo ảnh$/ }).click();

    await expect(page.getByRole("img", { name: /Kết quả #1/ })).toBeVisible({ timeout: 30_000 });
    const [request] = await sentRequests(page);
    expect(request?.tasks[0]).toMatchObject({ worker: "text-to-image", upscale: { resolution: "2K" } });
    expect(request?.tasks[0]?.params).not.toHaveProperty("duration");
});

test("Tiếp tục video từ thẻ kết quả: chuyển sang extend-video với video nguồn đã chọn", async ({ page }) => {
    test.setTimeout(90_000);
    await page.getByPlaceholder(/Nhập prompt/).fill("Một chú mèo đang lướt sóng");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Tiếp tục video" }).click();
    await expect(page.getByRole("button", { name: /^Chế độ/ })).toContainText("Tiếp tục video");
    await expect(page.getByText(/Đã chọn: Job #1/)).toBeVisible();
    await page.getByPlaceholder(/Nhập prompt/).fill("Chú mèo lên bờ và vẫy đuôi");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();

    await expect(resultVideos(page)).toHaveCount(2, { timeout: 30_000 });
    const requests = await sentRequests(page);
    expect(requests[1]?.tasks[0]).toMatchObject({ worker: "extend-video", sourceMediaId: expect.stringMatching(/^media_/) });
    expect(requests[1]?.tasks[0]?.params).not.toHaveProperty("duration");
});

test("QUEUE_FULL: hiện banner đếm ngược rồi tự gửi lại thành công", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("videogen:mock-queue-full", "1"));
    await page.getByPlaceholder(/Nhập prompt/).fill("Hoàng hôn trên núi");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();

    await expect(page.getByRole("status").filter({ hasText: "Hàng đợi đang đầy" })).toBeVisible();
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    expect(await sentRequests(page)).toHaveLength(1);
});

test("đổi chế độ xoá ảnh đã chọn; chọn chế độ bằng bàn phím", async ({ page }) => {
    await chooseMode(page, /Khung đầu → Video/);
    await slotInput(page, /^Khung đầu/).setInputFiles(fixture("a.png"));
    await expect(page.getByRole("region", { name: /^Khung đầu/ }).getByRole("img")).toBeVisible();

    await chooseMode(page, /Văn bản → Video/);
    await chooseMode(page, /Khung đầu → Video/);
    await expect(page.getByRole("region", { name: /^Khung đầu/ }).getByRole("img")).toHaveCount(0);

    const trigger = page.getByRole("button", { name: /^Chế độ/ });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toContainText("Khung đầu + cuối → Video");
});
