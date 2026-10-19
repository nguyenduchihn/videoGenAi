import type { Param, WorkerDoc } from "./types.ts";

// Nguồn: libs/tasks/src/domain/task-params.schemas.ts (PARAMS_BY_WORKER) + mặc định ở libs/google (model-resolver, prompt-helpers).
export const VIDEO_MODEL_IDS = ["Veo_3.1-Lite", "Veo_3.1-Fast", "Veo_3.1-Quality", "Veo_3.1-Omni", "Veo_3.1-Lite [Lower Priority]"] as const;
export const IMAGE_MODEL_IDS = ["Nano_Banana_Pro", "Nano_Banana_2", "Nano_Banana_2_Lite"] as const;
const VIDEO_MODELS = "`Veo_3.1-Lite` · `Veo_3.1-Fast` · `Veo_3.1-Quality` · `Veo_3.1-Omni` · `Veo_3.1-Lite [Lower Priority]` (miễn phí, xếp hàng chậm hơn)";
const IMAGE_MODELS = "`Nano_Banana_Pro` · `Nano_Banana_2` · `Nano_Banana_2_Lite`";

const prompt: Param = { name: "prompt", type: "string", required: true, description: "Mô tả nội dung, 1–4000 ký tự." };
const videoParams: Param[] = [
    prompt,
    { name: "model", type: "string", defaultValue: "Veo_3.1-Lite", description: `Một trong ${VIDEO_MODELS}. Bỏ trống mà \`duration\` khác 8 ⇒ \`Veo_3.1-Omni\`. Giá theo model: mục Models & giá.` },
    { name: "ratio", type: "string", defaultValue: "16:9", description: "`16:9` (ngang) hoặc `9:16` (dọc)." },
    { name: "duration", type: "integer", defaultValue: "8", description: "Số giây: `4` · `6` · `8` · `10`. Chỉ `Veo_3.1-Omni` làm được 4 / 6 / 10 giây." },
    { name: "audioEnabled", type: "boolean", defaultValue: "true", description: "`false` ⇒ chấp nhận video không tiếng khi âm thanh bị chặn." },
];
const imageParams: Param[] = [
    prompt,
    { name: "model", type: "string", defaultValue: "Nano_Banana_Pro", description: `Một trong ${IMAGE_MODELS}.` },
    { name: "ratio", type: "string", defaultValue: "16:9", description: "`1:1` · `16:9` · `9:16` · `4:3` · `3:4`." },
];

export const WORKERS: WorkerDoc[] = [
    {
        id: "text-to-video",
        title: "Văn bản → Video",
        kind: "video",
        summary: "Tạo video từ prompt.",
        imageRoles: [],
        params: videoParams,
        example: { method: "POST", path: "/v1/tasks", body: { tasks: [{ worker: "text-to-video", params: { prompt: "Hoàng hôn trên vịnh Hạ Long, máy quay lướt chậm", model: "Veo_3.1-Lite", ratio: "16:9" } }] } },
    },
    {
        id: "image-to-video",
        title: "Khung đầu → Video",
        kind: "video",
        summary: "Video bắt đầu từ một ảnh.",
        imageRoles: ["`images.start`: ảnh khung đầu (bắt buộc)."],
        params: videoParams,
        example: { method: "POST", path: "/v1/tasks", body: { tasks: [{ worker: "image-to-video", params: { prompt: "Máy quay từ từ tiến lại gần" }, images: { start: "img_01HZXSTART00" } }] } },
    },
    {
        id: "start-end-image-to-video",
        title: "Khung đầu + cuối → Video",
        kind: "video",
        summary: "Video chuyển cảnh giữa hai ảnh. Không hỗ trợ `Veo_3.1-Omni`.",
        imageRoles: ["`images.start`: ảnh khung đầu (bắt buộc).", "`images.end`: ảnh khung cuối (bắt buộc)."],
        params: videoParams,
        example: { method: "POST", path: "/v1/tasks", body: { tasks: [{ worker: "start-end-image-to-video", params: { prompt: "Chuyển cảnh từ ngày sang đêm" }, images: { start: "img_01HZXSTART00", end: "img_01HZXEND0000" } }] } },
    },
    {
        id: "reference-images-to-video",
        title: "Ảnh tham chiếu → Video",
        kind: "video",
        summary: "Giữ nhân vật / sản phẩm từ ảnh tham chiếu.",
        imageRoles: [
            "`images.references`: 1–3 ảnh (tới 7 với `Veo_3.1-Omni`).",
            "Phần tử dạng `{ \"imageId\": \"…\", \"handle\": \"girl\" }` ⇒ nhắc `@girl` trong prompt.",
        ],
        params: [
            ...videoParams,
            {
                name: "audio",
                type: "string",
                description: "Id giọng từ `GET /v1/voices`, vd `achernar` (không phân biệt hoa thường; alias `voice`). Dùng cùng một id cho mọi task để các video đồng bộ giọng. Bỏ trống hoặc `none` ⇒ Google tự chọn. Id lạ, mô tả tự do, hoặc chọn giọng khi `audioEnabled: false` ⇒ 400 ngay lúc tạo, không trừ credit. Lời thoại vẫn viết trong `prompt`.",
            },
        ],
        example: {
            method: "POST",
            path: "/v1/tasks",
            body: { tasks: [{ worker: "reference-images-to-video", params: { prompt: "@girl đi dạo trong công viên và nói: \"Chào buổi sáng!\"", audio: "achernar" }, images: { references: [{ imageId: "img_01HZXGIRL000", handle: "girl" }] } }] },
        },
    },
    {
        id: "text-to-image",
        title: "Văn bản → Ảnh",
        kind: "image",
        summary: "Tạo ảnh từ prompt.",
        imageRoles: [],
        params: [...imageParams, { name: "seed", type: "integer", description: "10000–99999, cùng seed + prompt ⇒ kết quả gần giống." }],
        example: { method: "POST", path: "/v1/tasks", body: { tasks: [{ worker: "text-to-image", params: { prompt: "Poster cà phê phong cách tối giản", ratio: "3:4" }, upscale: { resolution: "2K" } }] } },
    },
    {
        id: "image-to-image",
        title: "Ảnh tham chiếu → Ảnh",
        kind: "image",
        summary: "Tạo ảnh mới dựa trên ảnh nguồn.",
        imageRoles: ["`images.sources`: 1–10 ảnh nguồn."],
        params: imageParams,
        example: { method: "POST", path: "/v1/tasks", body: { tasks: [{ worker: "image-to-image", params: { prompt: "Đặt sản phẩm lên bàn gỗ, ánh sáng buổi sáng", ratio: "1:1" }, images: { sources: ["img_01HZXSRC0000"] } }] } },
    },
];

export const WORKER_IDS = WORKERS.map((w) => w.id);
