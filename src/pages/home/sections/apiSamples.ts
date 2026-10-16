import type { Lang } from "./highlight";

export interface ApiSample {
    id: "curl" | "node" | "python";
    label: string;
    lang: Lang;
    code: string;
}

export const API_BASE = "https://api.aiveo3.org";

/** Mẫu đúng hình dạng API thật: POST /v1/tasks nhận mảng `tasks`, `webhookUrl` ở cấp lô; 202 trả batchId + totalCredits. */
export const API_SAMPLES: ApiSample[] = [
    {
        id: "curl",
        label: "curl",
        lang: "bash",
        code: `# Tạo lô task: mỗi phần tử tasks là một job (video hoặc ảnh)
curl -X POST ${API_BASE}/v1/tasks \\
  -H "X-API-Key: vk_your_key" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tasks": [
      { "worker": "text-to-video",
        "params": { "prompt": "Hoàng hôn trên vịnh Hạ Long, máy quay lướt chậm", "model": "Veo_3.1-Lite" } },
      { "worker": "text-to-image",
        "params": { "prompt": "Poster cà phê phong cách tối giản" } }
    ],
    "webhookUrl": "https://your-app.com/hooks/veo"
  }'

# 202 Accepted
# { "batchId": "b_01HZX…", "totalCredits": 6, "tasks": [ { "id": "t_…", "status": "pending" }, … ] }

# Theo dõi cả lô (hoặc chờ webhook)
curl ${API_BASE}/v1/batches/b_01HZX… -H "X-API-Key: vk_your_key"`,
    },
    {
        id: "node",
        label: "Node.js",
        lang: "js",
        code: `// Node 18+: fetch và crypto có sẵn
const res = await fetch("${API_BASE}/v1/tasks", {
  method: "POST",
  headers: {
    "X-API-Key": process.env.VEO_API_KEY,
    "Idempotency-Key": crypto.randomUUID(), // gửi lại cùng key ⇒ không tạo lô trùng
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tasks: [{ worker: "text-to-video", params: { prompt: "Hoàng hôn trên vịnh Hạ Long", model: "Veo_3.1-Lite" } }],
    webhookUrl: "https://your-app.com/hooks/veo",
  }),
});
const { batchId, totalCredits, tasks } = await res.json(); // 202

// Webhook nhận POST khi lô xong; hoặc poll:
const batch = await fetch("${API_BASE}/v1/batches/" + batchId, { headers: { "X-API-Key": process.env.VEO_API_KEY } });`,
    },
    {
        id: "python",
        label: "Python",
        lang: "python",
        code: `import httpx, os, uuid

headers = {"X-API-Key": os.environ["VEO_API_KEY"], "Idempotency-Key": str(uuid.uuid4())}
r = httpx.post(
    "${API_BASE}/v1/tasks",
    headers=headers,
    json={
        "tasks": [{"worker": "text-to-video", "params": {"prompt": "Hoàng hôn trên vịnh Hạ Long", "model": "Veo_3.1-Lite"}}],
        "webhookUrl": "https://your-app.com/hooks/veo",
    },
)
batch = r.json()  # {"batchId": "b_…", "totalCredits": 5, "tasks": [{"id": "t_…", "status": "pending"}]}

# Lỗi luôn cùng một dạng: {"error": {"code": "INSUFFICIENT_CREDITS", "message": "...", "requestId": "..."}}
status = httpx.get(f"${API_BASE}/v1/batches/{batch['batchId']}", headers=headers).json()`,
    },
];
