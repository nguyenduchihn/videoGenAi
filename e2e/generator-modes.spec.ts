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

test("Ảnh tham chiếu → Video: tối đa 3 ảnh, @tên trong prompt, 3 prompt cùng một giọng; mention không gắn ảnh bị chặn", async ({ page }) => {
    await chooseMode(page, /Ảnh tham chiếu → Video/);
    const region = page.getByRole("region", { name: /^Ảnh tham chiếu/ });
    await expect(region.getByText("Tối đa 3 ảnh", { exact: true })).toBeVisible();
    await slotInput(page, /^Ảnh tham chiếu/).setInputFiles([fixture("a.png"), fixture("b.png"), fixture("c.png"), fixture("d.png")]);
    await expect(region.getByRole("alert")).toContainText("Chỉ chọn tối đa 3 ảnh.");
    await expect(region.getByRole("img")).toHaveCount(3);
    await region.getByLabel("Tên ảnh để nhắc trong prompt").first().fill("girl");

    // Chọn giọng trong popup: lọc Nữ + tìm "kore" ⇒ chọn Kore ⇒ "Chọn giọng Kore" đóng popup
    await page.getByRole("button", { name: /^Chọn giọng nói/ }).click();
    const dialog = page.getByRole("dialog", { name: "Chọn giọng nói" });
    await dialog.getByRole("button", { name: "Nữ", exact: true }).click();
    await expect(dialog.getByRole("radio", { name: /^Puck/ })).toHaveCount(0);
    await dialog.getByRole("searchbox", { name: "Tìm giọng" }).fill("kore");
    await dialog.getByRole("radio", { name: /^Kore/ }).check();
    await dialog.getByRole("button", { name: "Chọn giọng Kore" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Chọn giọng nói — đang dùng Kore/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nghe thử giọng Kore" })).toBeVisible();

    await page.getByPlaceholder(/Nhập prompt/).fill("@girl và @boy đi dạo trong công viên");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(page.getByRole("alert").last()).toContainText("nhắc @boy nhưng chưa có ảnh nào đặt tên @boy");

    await page.getByPlaceholder(/Nhập prompt/).fill('@girl nói: "Xin chào"\n@girl nói: "Hôm nay trời đẹp"\n@girl nói: "Hẹn gặp lại"');
    await page.getByRole("button", { name: /^Tạo 3 job$/ }).click();
    // Video tải lười (mobile chỉ render video đang thấy) ⇒ đếm thẻ job đã xong.
    const results = page.getByRole("region", { name: "Kết quả" });
    await expect(results.getByRole("article", { name: /^Job #/ })).toHaveCount(3, { timeout: 30_000 });
    await expect(results.getByText("Hoàn thành", { exact: true })).toHaveCount(3, { timeout: 30_000 });
    const tasks = (await sentRequests(page)).flatMap((r) => r.tasks);
    expect(tasks).toHaveLength(3);
    for (const task of tasks) {
        expect(task).toMatchObject({
            worker: "reference-images-to-video",
            params: { audio: "kore", audioEnabled: true, model: "Veo_3.1-Lite [Lower Priority]", duration: 8 },
            images: { references: [{ imageId: expect.any(String), handle: "girl" }, expect.any(String), expect.any(String)] },
        });
    }
    await expect(page.getByRole("region", { name: "Kết quả" }).getByText("Kore").first()).toBeVisible();
});

test("Giọng nói: popup chọn bằng bàn phím, Huỷ giữ giọng cũ; tắt audio ⇒ cảnh báo + chặn tạo, Bật audio gỡ chặn; giọng được nhớ khi quay lại chế độ", async ({ page }) => {
    await chooseMode(page, /Ảnh tham chiếu → Video/);
    const dialog = page.getByRole("dialog", { name: "Chọn giọng nói" });
    await page.getByRole("button", { name: /^Chọn giọng nói — chưa chọn/ }).click();
    await dialog.getByRole("radio", { name: /^Không chọn/ }).focus();
    await page.keyboard.press("ArrowDown"); // radio gốc: mũi tên vừa chuyển vừa chọn
    await expect(dialog.getByRole("radio", { name: /^Achernar/ })).toBeChecked();
    await dialog.getByRole("button", { name: "Chọn giọng Achernar" }).click();
    await expect(page.getByRole("button", { name: /đang dùng Achernar/ })).toBeVisible();

    // Huỷ / Esc không đổi giọng
    await page.getByRole("button", { name: /^Chọn giọng nói/ }).click();
    await dialog.getByRole("radio", { name: /^Puck/ }).check();
    await dialog.getByRole("button", { name: "Huỷ", exact: true }).click();
    await expect(page.getByRole("button", { name: /đang dùng Achernar/ })).toBeVisible();
    await page.getByRole("button", { name: /^Chọn giọng nói/ }).click();
    await expect(dialog.getByRole("radio", { name: /^Achernar/ })).toBeChecked();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    await page.getByRole("button", { name: "Cài đặt nâng cao" }).click();
    await page.getByRole("switch", { name: /Tạo audio cho video/ }).click();
    await page.getByRole("button", { name: "Đóng cài đặt" }).click();
    await expect(page.getByText("Audio đang tắt nên giọng không có tác dụng.")).toBeVisible();
    await slotInput(page, /^Ảnh tham chiếu/).setInputFiles([fixture("a.png")]);
    await page.getByPlaceholder(/Nhập prompt/).fill("cô gái vẫy tay");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();
    await expect(page.getByRole("alert").last()).toContainText("audio đang tắt");
    await page.getByRole("button", { name: "Bật audio" }).click();
    await expect(page.getByText("Audio đang tắt nên giọng không có tác dụng.")).toHaveCount(0);

    await chooseMode(page, /Văn bản → Video/);
    await chooseMode(page, /Ảnh tham chiếu → Video/);
    await expect(page.getByRole("button", { name: /đang dùng Achernar/ })).toBeVisible();
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

    await page.getByRole("button", { name: "Tiếp tục video" }).first().click();
    await expect(page.getByRole("button", { name: /^Chế độ/ })).toContainText("Tiếp tục video");
    await expect(page.getByText(/Đã chọn: Job #1/)).toBeVisible();
    await page.getByPlaceholder(/Nhập prompt/).fill("Chú mèo lên bờ và vẫy đuôi");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();

    // Video của lượt trước vẫn hiển thị tới khi lượt mới thay thế ⇒ chờ đúng yêu cầu thứ 2 tới mock rồi mới đọc.
    await expect.poll(async () => (await sentRequests(page)).length, { timeout: 15_000 }).toBe(2);
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    const requests = await sentRequests(page);
    expect(requests[1]?.tasks[0]).toMatchObject({ worker: "extend-video", sourceMediaId: expect.stringMatching(/^media_/) });
    expect(requests[1]?.tasks[0]?.params).not.toHaveProperty("duration");
});

test("QUEUE_FULL: phần còn lại xếp hàng trên máy chủ rồi vẫn hoàn thành (tắt tab không mất)", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("videogen:mock-queue-full", "1"));
    await page.getByPlaceholder(/Nhập prompt/).fill("Hoàng hôn trên núi");
    await page.getByRole("button", { name: /^Tạo video$/ }).click();

    await expect(page.getByRole("status").filter({ hasText: /xếp hàng trên máy chủ|hoàn thành/ }).first()).toBeVisible({ timeout: 15_000 });
    await expect(resultVideos(page).first()).toBeVisible({ timeout: 30_000 });
    expect(await sentRequests(page)).toHaveLength(0); // chunk đầu bị 429 ⇒ đi đường POST /v1/runs/:id/items
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
