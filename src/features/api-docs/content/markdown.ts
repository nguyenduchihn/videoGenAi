import { codeSamples, resolvePath } from "./codeSamples.ts";
import { API_BASE, DOCS_UPDATED, SITE_URL, SUPPORT_EMAIL } from "./constants.ts";
import { SECTIONS } from "./sections.ts";
import type { Block, Inline, Param } from "./types.ts";
import { WORKERS } from "./workers.ts";

// Bản .md cho người và AI agent đọc: cùng manifest với trang /api-docs. Link nội bộ (/x) đổi thành tuyệt đối.
const absolute = (text: Inline): string => text.replace(/\]\((\/[^)]*)\)/g, (_, p: string) => `](${p.startsWith("/docs") ? API_BASE : SITE_URL}${p})`);
const cell = (text: Inline): string => absolute(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
const fence = (lang: string, code: string): string => `\`\`\`${lang}\n${code}\n\`\`\``;

function table(head: string[], rows: Inline[][]): string {
    return [`| ${head.map(cell).join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
}

const paramsTable = (params: Param[]): string =>
    table(["Tham số", "Kiểu", "Bắt buộc", "Mặc định", "Mô tả"], params.map((p) => [`\`${p.name}\``, p.type, p.required ? "có" : "", p.defaultValue ? `\`${p.defaultValue}\`` : "", p.description]));

function workersMd(): string {
    return WORKERS.map((w) => {
        const s = codeSamples(w.example);
        return [
            `### \`${w.id}\`: ${w.title}`,
            absolute(w.summary),
            ...(w.imageRoles.length ? [w.imageRoles.map((r) => `- ${absolute(r)}`).join("\n")] : []),
            paramsTable(w.params),
            fence("bash", s.curl),
        ].join("\n\n");
    }).join("\n\n");
}

function blockMd(b: Block): string {
    switch (b.kind) {
        case "p":
            return absolute(b.text);
        case "h3":
            return `### ${b.text}`;
        case "list":
            return b.items.map((t, i) => `${b.ordered ? `${i + 1}.` : "-"} ${absolute(t)}`).join("\n");
        case "callout":
            return `> ${absolute(b.text)}`;
        case "endpoint":
            return `**\`${b.method} ${b.path}\`**: ${absolute(b.summary)}`;
        case "request": {
            const s = codeSamples(b.example);
            const title = b.title ? `**${b.title}** (\`${b.example.method} ${resolvePath(b.example)}\`)\n\n` : "";
            return `${title}${fence("bash", s.curl)}\n\n${fence("python", s.python)}`;
        }
        case "code":
            return `${b.title ? `**${b.title}**\n\n` : ""}${fence(b.lang === "js" ? "javascript" : b.lang, b.code)}`;
        case "samples":
            return `${b.title ? `**${b.title}**\n\n` : ""}${b.tabs.map((t) => fence(t.lang === "js" ? "javascript" : t.lang, t.code)).join("\n\n")}`;
        case "table":
            return table(b.head, b.rows);
        case "params":
            return paramsTable(b.params);
        case "copy":
            return `${b.label}: \`${b.value}\``;
        case "workers":
            return workersMd();
        case "lifecycle":
            return "`pending` (chờ) → `processing` (đang tạo; `stage` = `generate` | `upscale`) → `succeeded` | `failed` | `cancelled`.";
        case "live":
            return absolute(b.fallback);
    }
}

export function renderMarkdown(): string {
    const toc = SECTIONS.map((s, i) => `${i + 1}. [${s.title}](#${s.id})`).join("\n");
    const body = SECTIONS.map((s) => [`<a id="${s.id}"></a>`, `## ${s.title}`, absolute(s.lead), ...s.blocks.map(blockMd)].join("\n\n")).join("\n\n---\n\n");
    return [
        "# VideoGen AI API",
        `> Tài liệu tích hợp, cập nhật ${DOCS_UPDATED}. Trang web: ${SITE_URL}/api-docs · Tham chiếu OpenAPI: ${API_BASE}/docs · Hỗ trợ: ${SUPPORT_EMAIL}`,
        toc,
        body,
        "",
    ].join("\n\n");
}

/** llms.txt (llmstxt.org): tiêu đề, tóm tắt, danh sách link có mô tả. */
export function renderLlmsTxt(): string {
    return [
        "# VideoGen AI API",
        "> REST API tạo video (Google Veo 3.1) và ảnh (Nano Banana) theo lô. Xác thực bằng header X-API-Key hoặc Authorization: Bearer. Kết quả qua poll hoặc webhook ký HMAC-SHA256.",
        `Base URL: ${API_BASE}/v1. Mọi lỗi có dạng { "error": { "code", "message", "requestId" } }.`,
        "## Tài liệu",
        [`- [Tài liệu đầy đủ (Markdown)](${SITE_URL}/api-docs.md): mọi mục dưới đây trong một file`, ...SECTIONS.map((s) => `- [${s.title}](${SITE_URL}/api-docs#${s.id}): ${absolute(s.lead)}`)].join("\n"),
        "## Đặc tả",
        [`- [OpenAPI 3 (JSON)](${API_BASE}/docs/json): mọi endpoint /v1 và schema`, `- [Postman collection](${API_BASE}/docs/postman.json)`].join("\n"),
        "",
    ].join("\n\n");
}
