import { API_BASE, KEY_PLACEHOLDER, SITE_URL } from "./constants.ts";
import { KEY_ENV } from "./codeSamples.ts";
import type { DocSection } from "./types.ts";

const TASK_RESPONSE = `{
  "batchId": "b_01HZX9K2M4",
  "totalCredits": 6,
  "tasks": [
    { "id": "t_01HZX9K2M5", "batchId": "b_01HZX9K2M4", "status": "pending", "worker": "text-to-video", "model": "Veo_3.1-Lite", "priceCredits": 5, "result": null, "error": null },
    { "id": "t_01HZX9K2M6", "batchId": "b_01HZX9K2M4", "status": "pending", "worker": "text-to-image", "model": "Nano_Banana_Pro", "priceCredits": 1, "result": null, "error": null }
  ]
}`;

const SUCCEEDED_TASK = `{
  "id": "t_01HZX9K2M5",
  "batchId": "b_01HZX9K2M4",
  "status": "succeeded",
  "worker": "text-to-video",
  "model": "Veo_3.1-Lite",
  "priceCredits": 5,
  "result": {
    "mediaId": "3f6c2a8e-1b4d-4c7a-9e2f-5a6b7c8d9e0f",
    "url": "https://files.aiveo3.org/outputs/…?X-Amz-Signature=…",
    "downloadUrl": "https://files.aiveo3.org/outputs/…&response-content-disposition=attachment…"
  },
  "error": null
}`;

const WEBHOOK_BODIES = `{ "id": "t_01HZX9K2M5", "batchId": "b_01HZX9K2M4", "status": "succeeded", "result": { "mediaId": "3f6c2a8e-1b4d-4c7a-9e2f-5a6b7c8d9e0f" } }
{ "id": "t_01HZX9K2M6", "batchId": "b_01HZX9K2M4", "status": "failed", "error": { "code": "CONTENT_POLICY", "message": "prompt rejected" } }
{ "id": "t_01HZX9K2M7", "batchId": "b_01HZX9K2M4", "status": "cancelled" }`;

const ERROR_SAMPLE = `{
  "error": {
    "code": "BAD_IMAGE_INPUTS",
    "message": "image-to-video needs images.start",
    "requestId": "7f1c2a9e-…",
    "metadata": { "field": "images.start", "constraint": "required" }
  }
}`;

const VERIFY_NODE = `import { createHmac, timingSafeEqual } from "node:crypto";

// rawBody: chuỗi body NGUYÊN BẢN (chưa JSON.parse). Express: express.raw({ type: "application/json" })
export function verifyVeoWebhook(rawBody, headers, secret = process.env.VIDEOGEN_WEBHOOK_SECRET) {
  const ts = headers["x-veo-timestamp"];
  const sig = headers["x-veo-signature"] ?? "";
  if (!ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false; // chống gửi lại sau 5 phút
  const expected = createHmac("sha256", secret).update(\`\${ts}.\${rawBody}\`).digest("hex");
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}`;

const VERIFY_PYTHON = `import hashlib
import hmac
import os
import time

def verify_veo_webhook(raw_body: bytes, headers, secret: str = os.environ["VIDEOGEN_WEBHOOK_SECRET"]) -> bool:
    ts = headers.get("x-veo-timestamp", "")
    sig = headers.get("x-veo-signature", "")
    if not ts or abs(time.time() - int(ts)) > 300:  # chống gửi lại sau 5 phút
        return False
    expected = hmac.new(secret.encode(), f"{ts}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, expected)`;

const AGENT_PROMPT = `Đọc tài liệu API tại ${SITE_URL}/llms.txt (bản đầy đủ: ${SITE_URL}/api-docs.md).
Viết hàm Python tạo 1 video 9:16 từ prompt, poll /v1/batches/{batchId} mỗi 5 giây
tới khi xong rồi tải result.downloadUrl về máy. API key lấy từ biến môi trường ${KEY_ENV}.`;

export const SECTIONS: DocSection[] = [
    {
        id: "tong-quan",
        title: "Tổng quan",
        lead: "REST API tạo video và ảnh bằng Google Veo / Nano Banana, gửi theo lô, nhận kết quả qua poll hoặc webhook.",
        blocks: [
            { kind: "copy", label: "Base URL", value: `${API_BASE}/v1` },
            {
                kind: "list",
                items: [
                    "**Theo lô:** một request tạo tối đa 20 task, trộn video và ảnh. Cả lô được tạo hoặc bị từ chối cùng nhau.",
                    "**Ảnh đầu vào:** upload một lần, dùng lại bằng `imageId` trong nhiều task (giữ 24 giờ).",
                    "**Kết quả:** poll trạng thái hoặc đặt `webhookUrl` để server gọi khi task kết thúc.",
                    "**Credit:** trừ lúc tạo task, hoàn đủ khi task lỗi hoặc bị huỷ.",
                ],
            },
            { kind: "callout", tone: "info", text: `Cần tra từng trường của request/response? Xem [tham chiếu đầy đủ](/docs) (OpenAPI, có nút thử trực tiếp).` },
        ],
    },
    {
        id: "khoi-dong-nhanh",
        title: "Khởi động nhanh",
        lead: "Từ lúc có key tới video đầu tiên trong 4 bước.",
        blocks: [
            {
                kind: "list",
                ordered: true,
                items: [
                    `Tạo API key ở trang [API key](/settings/api-keys) rồi lưu vào biến môi trường: \`export ${KEY_ENV}=${KEY_PLACEHOLDER}\`.`,
                    "(Tuỳ chọn) Upload ảnh đầu vào bằng `POST /v1/images` nếu chế độ cần ảnh.",
                    "Gửi `POST /v1/tasks` với mảng `tasks` ⇒ nhận `batchId` và `id` từng task (HTTP 202).",
                    "Poll `GET /v1/batches/{batchId}` mỗi 3–5 giây tới khi mọi task `succeeded` / `failed`, hoặc chờ webhook.",
                ],
            },
            {
                kind: "request",
                title: "Bước 3: tạo một video và một ảnh trong cùng lô",
                example: {
                    method: "POST",
                    path: "/v1/tasks",
                    body: {
                        tasks: [
                            { worker: "text-to-video", params: { prompt: "Hoàng hôn trên vịnh Hạ Long, máy quay lướt chậm", ratio: "9:16" } },
                            { worker: "text-to-image", params: { prompt: "Poster cà phê phong cách tối giản" } },
                        ],
                        webhookUrl: "https://your-app.com/hooks/videogen",
                    },
                },
            },
            { kind: "code", lang: "json", title: "202 Accepted", code: TASK_RESPONSE },
            { kind: "request", title: "Bước 4: theo dõi cả lô", example: { method: "GET", path: "/v1/batches/{batchId}", pathValues: { batchId: "b_01HZX9K2M4" } } },
        ],
    },
    {
        id: "xac-thuc",
        title: "Xác thực",
        lead: "Mọi endpoint `/v1/*` cần API key.",
        blocks: [
            { kind: "p", text: "Gửi key theo **một** trong hai cách, kết quả như nhau:" },
            { kind: "copy", label: "Header", value: `X-API-Key: ${KEY_PLACEHOLDER}` },
            { kind: "copy", label: "Hoặc", value: `Authorization: Bearer ${KEY_PLACEHOLDER}` },
            { kind: "live", widget: "yourKey", fallback: "Tạo và quản lý key ở trang [API key](/settings/api-keys) sau khi đăng nhập." },
            {
                kind: "list",
                items: [
                    "Key `vk_…` chỉ hiện **một lần** lúc tạo. Mất key ⇒ thu hồi và tạo key mới.",
                    "Nghi lộ key ⇒ bấm **Xoay key**: mọi key đang hoạt động bị từ chối ngay, bạn nhận một key mới.",
                    "Không đặt key trong code chạy ở trình duyệt hay app di động. Gọi API từ server của bạn.",
                ],
            },
            { kind: "request", title: "Kiểm tra key", example: { method: "GET", path: "/v1/me" } },
        ],
    },
    {
        id: "models",
        title: "Models & giá",
        lead: "Credit mỗi job phụ thuộc chế độ và model; upscale tính thêm.",
        blocks: [
            { kind: "live", widget: "models", fallback: "Bảng giá hiện hành: `GET /v1/models` (cần key) hoặc trang [Bảng giá](/pricing)." },
            { kind: "endpoint", method: "GET", path: "/v1/models", summary: "Danh sách model dùng được trong `params.model`, kèm credit và model mặc định." },
            { kind: "callout", tone: "info", text: "`Veo_3.1-Lite [Lower Priority]` là video miễn phí theo gói, xếp hàng chậm hơn. Gói không trừ credit vẫn bị giới hạn số job video mỗi ngày (xem mục Giới hạn)." },
        ],
    },
    {
        id: "tao-task",
        title: "Tạo task",
        lead: "`POST /v1/tasks`: tối đa 20 task mỗi request, mỗi task chọn một `worker` (chế độ tạo).",
        blocks: [
            { kind: "endpoint", method: "POST", path: "/v1/tasks", summary: "Tạo lô task. Trả 202 với `batchId`, `totalCredits` và danh sách task." },
            {
                kind: "params",
                params: [
                    { name: "tasks", type: "array", required: true, description: "1–20 phần tử `{ worker, params, images?, upscale? }`." },
                    { name: "tasks[].worker", type: "string", required: true, description: "Chế độ tạo, xem 7 thẻ bên dưới." },
                    { name: "tasks[].params", type: "object", required: true, description: "Tham số theo worker (`prompt`, `model`, `ratio`…)." },
                    { name: "tasks[].images", type: "object", description: "Ảnh đầu vào theo vai trò, giá trị là `imageId` từ `POST /v1/images`." },
                    { name: "tasks[].upscale", type: "object", description: "`{ \"resolution\": \"2K\" }`, xem mục Upscale." },
                    { name: "webhookUrl", type: "string", description: "URL **https công khai** nhận thông báo khi từng task kết thúc." },
                ],
            },
            { kind: "workers" },
            { kind: "callout", tone: "warn", text: "Cả lô được tạo hoặc bị từ chối cùng nhau. Không đủ credit ⇒ `402 INSUFFICIENT_CREDITS`, không task nào được tạo." },
        ],
    },
    {
        id: "anh-dau-vao",
        title: "Ảnh đầu vào",
        lead: "Upload trước, tham chiếu bằng `imageId` theo vai trò.",
        blocks: [
            { kind: "endpoint", method: "POST", path: "/v1/images", summary: "multipart/form-data, tối đa 100 file / request, 20 MB / file." },
            { kind: "request", example: { method: "POST", path: "/v1/images", files: { start: "start.png", end: "end.png" } } },
            {
                kind: "table",
                head: ["Vai trò", "Worker", "Số ảnh"],
                rows: [
                    ["`start`", "`image-to-video`, `start-end-image-to-video`", "1"],
                    ["`end`", "`start-end-image-to-video`", "1"],
                    ["`references`", "`reference-images-to-video`", "1–3 (Omni: tới 7)"],
                    ["`sources`", "`image-to-image`", "1–10"],
                ],
            },
            {
                kind: "list",
                items: [
                    "Mỗi phần tử trả về có `name` = tên field bạn đặt (vd `start`) ⇒ biết ngay id nào cho vai trò nào.",
                    "Ảnh trùng nội dung dùng chung `imageId` (`duplicateOf` cho biết ảnh gốc).",
                    "Ảnh giữ **24 giờ**; dùng trong task ⇒ tự gia hạn thêm 24 giờ. Hết hạn ⇒ `404 IMAGE_NOT_FOUND`.",
                    "`references` nhận `{ \"imageId\": \"…\", \"handle\": \"girl\" }` để nhắc `@girl` trong prompt.",
                ],
            },
            { kind: "endpoint", method: "GET", path: "/v1/images", summary: "Ảnh còn hạn của bạn." },
            { kind: "endpoint", method: "DELETE", path: "/v1/images/{id}", summary: "Xoá ảnh trước hạn." },
        ],
    },
    {
        id: "theo-doi",
        title: "Theo dõi & kết quả",
        lead: "Task đi qua `pending` → `processing` → `succeeded` | `failed` | `cancelled`.",
        blocks: [
            { kind: "lifecycle" },
            { kind: "endpoint", method: "GET", path: "/v1/batches/{batchId}", summary: "Trạng thái mọi task của một lô." },
            { kind: "endpoint", method: "GET", path: "/v1/tasks", summary: "Theo danh sách `?ids=a,b,c` (≤ 100) hoặc lịch sử có phân trang." },
            { kind: "endpoint", method: "GET", path: "/v1/tasks/{id}", summary: "Chi tiết một task." },
            { kind: "endpoint", method: "POST", path: "/v1/tasks/{id}/cancel", summary: "Huỷ task chưa kết thúc, hoàn credit." },
            { kind: "endpoint", method: "POST", path: "/v1/batches/{batchId}/cancel", summary: "Huỷ phần chưa kết thúc của lô." },
            { kind: "code", lang: "json", title: "Task đã xong", code: SUCCEEDED_TASK },
            {
                kind: "list",
                items: [
                    "`result.url` để xem / nhúng, `result.downloadUrl` để tải về đúng tên file. Cả hai **hết hạn sau 1 giờ**: gọi lại GET để lấy link mới.",
                    "Task `failed` có `error: { code, message }` và được hoàn credit tự động.",
                ],
            },
        ],
    },
    {
        id: "runs",
        title: "Lượt lớn (Runs)",
        lead: "Hơn 20 job, hoặc nhiều hơn hàng đợi của gói: để máy chủ xếp hàng và đếm tiến độ.",
        blocks: [
            {
                kind: "list",
                ordered: true,
                items: [
                    "Tự sinh một UUID làm id lượt, gọi `PUT /v1/runs/{id}` với `totalPlanned`. Gọi lại cùng id không tạo trùng.",
                    "Gửi từng chunk ≤ 20 bằng `POST /v1/tasks` kèm `runId` và `runOffset` (thứ tự job đầu chunk).",
                    "Gặp `429 QUEUE_FULL` ⇒ gửi phần còn lại vào `POST /v1/runs/{id}/items`: máy chủ tự đẩy dần khi có chỗ.",
                    "Theo dõi bằng `GET /v1/runs/{id}` (đếm theo trạng thái, ETA) và `GET /v1/runs/{id}/tasks`.",
                ],
            },
            {
                kind: "request",
                title: "Tạo lượt 200 job",
                example: { method: "PUT", path: "/v1/runs/{id}", pathValues: { id: "6f1d7c2e-8a4b-4f3e-9c1d-2b3a4c5d6e7f" }, body: { name: "Video sản phẩm tháng 10", totalPlanned: 200 } },
            },
            { kind: "endpoint", method: "POST", path: "/v1/runs/{id}/retry-failed", summary: "Thử lại các job thất bại." },
            { kind: "endpoint", method: "POST", path: "/v1/runs/{id}/cancel", summary: "Huỷ phần chưa chạy." },
            { kind: "endpoint", method: "GET", path: "/v1/runs/{id}/download", summary: "Tải mọi kết quả thành công thành một file ZIP (kiểm tra trước bằng `/download/preflight`)." },
            { kind: "callout", tone: "info", text: "Gửi lại chunk trùng `runOffset` ⇒ `409 RUN_INDEX_TAKEN`, không tạo gì thêm: an toàn khi mạng chập chờn." },
        ],
    },
    {
        id: "upscale",
        title: "Upscale",
        lead: "Thêm `upscale` vào task: gen xong hệ thống tự nâng độ phân giải.",
        blocks: [
            { kind: "table", head: ["Loại", "`upscale.resolution`"], rows: [["Ảnh", "`2K` · `4K`"], ["Video", "`1080P` · `4K`"]] },
            {
                kind: "list",
                items: [
                    "Credit upscale cộng vào `priceCredits` của task.",
                    "Trong lúc upscale, task ở `processing` với `stage: \"upscale\"`.",
                    "Upscale lỗi ⇒ task vẫn `succeeded` với bản gốc, `result.upscale.status = \"failed\"`, hoàn phần credit upscale.",
                    "Upscale thành công ⇒ `result` là bản đã nâng, bản gốc ở `result.base`.",
                ],
            },
        ],
    },
    {
        id: "webhook",
        title: "Webhook",
        lead: "Server gọi `webhookUrl` của bạn mỗi khi một task kết thúc.",
        blocks: [
            { kind: "p", text: "Body là JSON gọn của task. Cần link tải ⇒ gọi `GET /v1/tasks/{id}` (link presign có hạn nên không gửi trong webhook)." },
            { kind: "code", lang: "json", title: "Ba dạng body", code: WEBHOOK_BODIES },
            { kind: "p", text: "Hai header để kiểm chữ ký:" },
            {
                kind: "table",
                head: ["Header", "Nội dung"],
                rows: [
                    ["`x-veo-timestamp`", "Giây Unix lúc gửi."],
                    ["`x-veo-signature`", "`hex(HMAC_SHA256(secret, timestamp + \".\" + rawBody))`"],
                ],
            },
            { kind: "p", text: "`secret` (`whsec_…`) xem và xoay ở tab **Cấu hình API key & Webhook** phía trên, hoặc trang [API key](/settings/api-keys)." },
            { kind: "samples", title: "Kiểm chữ ký", tabs: [{ label: "Node.js", lang: "js", code: VERIFY_NODE }, { label: "Python", lang: "python", code: VERIFY_PYTHON }] },
            {
                kind: "list",
                items: [
                    "Trả **2xx trong 10 giây**. Xử lý nặng thì đưa vào hàng đợi rồi trả 200 ngay.",
                    "Lỗi hoặc quá 10 giây ⇒ gửi lại sau 10 giây, 30 giây, 2 phút, 10 phút, 30 phút (tổng cộng tối đa 6 lần).",
                    "Có thể nhận trùng: dùng `id` của task để bỏ qua bản đã xử lý.",
                    "Vừa xoay khoá: webhook đang gửi dở (tối đa khoảng 1 phút) có thể còn ký khoá cũ; bị từ chối thì hệ thống tự gửi lại bằng khoá mới.",
                    "Không theo redirect, chỉ gửi tới URL https công khai.",
                ],
            },
        ],
    },
    {
        id: "gui-lai-an-toan",
        title: "Gửi lại an toàn",
        lead: "`Idempotency-Key` chống tạo trùng khi mạng lỗi; `X-Request-Id` để truy vết.",
        blocks: [
            {
                kind: "request",
                title: "Gửi lại cùng key ⇒ nhận lại đúng response cũ",
                example: { method: "POST", path: "/v1/tasks", headers: { "Idempotency-Key": "order-1042-video" }, body: { tasks: [{ worker: "text-to-video", params: { prompt: "Mở hộp sản phẩm" } }] } },
            },
            {
                kind: "table",
                head: ["Tình huống", "Kết quả"],
                rows: [
                    ["Cùng key, cùng body", "Response cũ, không tạo thêm, không trừ thêm credit"],
                    ["Cùng key, khác body", "`422 IDEMPOTENCY_MISMATCH`"],
                    ["Request trước còn đang chạy", "`409 IN_PROGRESS`, thử lại sau 1 giây"],
                ],
            },
            { kind: "p", text: "Key dài 8–128 ký tự `[A-Za-z0-9_-]`. Header `X-Request-Id` (≤ 64 ký tự) do bạn đặt sẽ được trả lại trong response và log, tiện đối chiếu khi cần hỗ trợ." },
        ],
    },
    {
        id: "gioi-han",
        title: "Giới hạn & gói",
        lead: "Mỗi gói giới hạn số job chạy đồng thời, số task chờ và số request mỗi giây.",
        blocks: [
            { kind: "live", widget: "planLimits", fallback: "Giới hạn của key hiện tại: `GET /v1/me` → `plan` (`maxConcurrent`, `maxPending`, `ratePerSec`, `statusRatePerSec`, `fairUsePerDay`)." },
            {
                kind: "table",
                head: ["Mã", "Khi nào", "Nên làm"],
                rows: [
                    ["`429 RATE_LIMITED`", "Quá số request mỗi giây", "Đợi 1 giây rồi gửi lại"],
                    ["`429 QUEUE_FULL`", "Task chờ + đang chạy vượt `maxPending`", "Chờ khoảng 30 giây, hoặc dùng Runs để máy chủ xếp hàng"],
                    ["`429 FAIR_USE`", "Hết số job video trong ngày (giờ Việt Nam) của gói", "Đợi sang ngày mới hoặc nâng gói"],
                ],
            },
        ],
    },
    {
        id: "tai-khoan",
        title: "Tài khoản",
        lead: "Số dư, gói và sao kê credit của key.",
        blocks: [
            { kind: "endpoint", method: "GET", path: "/v1/me", summary: "Số dư `credits`, trạng thái, gói và giới hạn." },
            { kind: "endpoint", method: "GET", path: "/v1/credits/ledger", summary: "Sao kê: giữ chỗ, trừ, hoàn, nạp." },
        ],
    },
    {
        id: "loi",
        title: "Mã lỗi",
        lead: "Mọi lỗi cùng một dạng; rẽ nhánh theo `error.code`, không theo `message`.",
        blocks: [
            { kind: "code", lang: "json", code: ERROR_SAMPLE },
            {
                kind: "table",
                head: ["HTTP", "code", "Ý nghĩa"],
                rows: [
                    ["400", "`VALIDATION_FAILED`", "Body sai, xem `details[].path`"],
                    ["400", "`BAD_IMAGE_INPUTS`", "Thiếu / thừa ảnh theo vai trò; `metadata` chỉ rõ trường"],
                    ["400", "`BAD_UPSCALE`", "`resolution` không hợp với loại media"],
                    ["401", "`UNAUTHENTICATED`", "Thiếu key hoặc key đã thu hồi"],
                    ["402", "`INSUFFICIENT_CREDITS`", "Không đủ credit cho cả lô"],
                    ["403", "`ACCOUNT_SUSPENDED` · `PLAN_EXPIRED`", "Tài khoản bị khoá / gói hết hạn"],
                    ["404", "`IMAGE_NOT_FOUND` · `TASK_NOT_FOUND` · `SOURCE_MEDIA_NOT_FOUND`", "Không tồn tại hoặc không thuộc về bạn"],
                    ["409", "`IN_PROGRESS` · `TASK_FINISHED` · `RUN_INDEX_TAKEN`", "Xung đột trạng thái"],
                    ["413", "`PAYLOAD_TOO_LARGE`", "File hoặc body quá lớn"],
                    ["422", "`IDEMPOTENCY_MISMATCH`", "Cùng Idempotency-Key nhưng khác body"],
                    ["429", "`RATE_LIMITED` · `QUEUE_FULL` · `FAIR_USE`", "Xem mục Giới hạn"],
                    ["5xx", "`INTERNAL` · `SERVICE_UNAVAILABLE`", "Lỗi phía máy chủ, thử lại sau; gửi kèm `requestId` khi cần hỗ trợ"],
                ],
            },
            { kind: "p", text: "Task thất bại sau khi tạo (vd `CONTENT_POLICY`, `IMAGE_UPLOAD_FAILED`) không trả lỗi HTTP mà nằm ở `task.error`, credit được hoàn." },
        ],
    },
    {
        id: "ai-agent",
        title: "Dùng với AI agent",
        lead: "Đưa tài liệu cho Claude, ChatGPT, Cursor… để agent tự viết code tích hợp.",
        blocks: [
            { kind: "copy", label: "llms.txt", value: `${SITE_URL}/llms.txt` },
            { kind: "copy", label: "Markdown", value: `${SITE_URL}/api-docs.md` },
            { kind: "copy", label: "OpenAPI", value: `${API_BASE}/docs/json` },
            { kind: "code", lang: "bash", title: "Prompt mẫu", code: AGENT_PROMPT },
        ],
    },
    {
        id: "thay-doi",
        title: "Thay đổi",
        lead: "Thay đổi đáng chú ý của API.",
        blocks: [
            {
                kind: "table",
                head: ["Ngày", "Thay đổi"],
                rows: [
                    ["2026-10-16", "Chấp nhận `Authorization: Bearer`. Webhook ký bằng khoá riêng của từng khách (`whsec_…`). Có Postman collection và `llms.txt`."],
                    ["2026-10-15", "Upload ảnh trả `name`, `filename`, `duplicateOf`; `references` nhận `handle`."],
                ],
            },
        ],
    },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
