// Manifest tài liệu API: một nguồn cho trang /api-docs (React), api-docs.md / llms.txt (plugin Vite) và test drift.
// Chỉ import tương đối, không React/CSS ⇒ vite.config.ts nạp được lúc build.

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Chuỗi có định dạng inline tối giản: `code`, **đậm**, [chữ](url). */
export type Inline = string;

export interface Param {
    name: string;
    type: string;
    required?: boolean;
    defaultValue?: string;
    description: Inline;
}

export interface RequestExample {
    method: HttpMethod;
    /** Đường dẫn thật trong spec, tham số dạng {id}; `pathValues` thay giá trị mẫu khi sinh code. */
    path: string;
    pathValues?: Record<string, string>;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
    /** multipart/form-data: tên field ⇒ tên file mẫu. */
    files?: Record<string, string>;
}

export type CodeLang = "bash" | "js" | "python" | "json";

/** Widget chỉ có ở trang web (dữ liệu sống / cá nhân hoá); markdown dùng `fallback`. */
export type LiveWidget = "models" | "planLimits" | "yourKey";

export type Block =
    | { kind: "p"; text: Inline }
    | { kind: "h3"; text: string }
    | { kind: "list"; ordered?: boolean; items: Inline[] }
    | { kind: "callout"; tone: "info" | "warn"; text: Inline }
    | { kind: "endpoint"; method: HttpMethod; path: string; summary: Inline }
    | { kind: "request"; example: RequestExample; title?: string }
    | { kind: "code"; lang: CodeLang; code: string; title?: string }
    | { kind: "samples"; title?: string; tabs: Array<{ label: string; lang: CodeLang; code: string }> }
    | { kind: "table"; head: string[]; rows: Inline[][] }
    | { kind: "params"; params: Param[] }
    | { kind: "copy"; label: string; value: string }
    | { kind: "workers" }
    | { kind: "lifecycle" }
    | { kind: "live"; widget: LiveWidget; fallback: Inline };

export interface DocSection {
    id: string;
    title: string;
    /** Một câu tóm tắt dưới tiêu đề (cũng là mô tả trong llms.txt). */
    lead: Inline;
    blocks: Block[];
}

export interface WorkerDoc {
    id: string;
    title: string;
    kind: "video" | "image";
    summary: Inline;
    /** Vai trò ảnh trong `images` mà worker này nhận. */
    imageRoles: Inline[];
    params: Param[];
    example: RequestExample;
}
