import { defineConfig, devices } from "@playwright/test";

// E2E chạy trên Vite dev server ở chế độ mock (MSW) ⇒ không cần backend, không cần cookie thật.
const PORT = 5175;
export const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
    testDir: "./e2e",
    outputDir: "./e2e/.results",
    snapshotDir: "./e2e/__screenshots__",
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    timeout: 30_000,
    expect: { timeout: 8_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled", caret: "hide" } },
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
    use: {
        baseURL: BASE,
        locale: "vi-VN",
        timezoneId: "Asia/Ho_Chi_Minh",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: {
        command: `VITE_USE_MOCK_API=true npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: BASE,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
        { name: "mobile", use: { ...devices["Pixel 5"] } },
    ],
});
