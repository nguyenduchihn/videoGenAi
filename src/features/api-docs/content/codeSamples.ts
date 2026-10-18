import { API_BASE } from "./constants.ts";
import type { RequestExample } from "./types.ts";

// Sinh cURL / Python (requests) / Node.js (fetch) từ CÙNG một ví dụ ⇒ ba ngôn ngữ không lệch nhau.
export const KEY_ENV = "VIDEOGEN_API_KEY";

export interface CodeSamples {
    curl: string;
    python: string;
    node: string;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

export function resolvePath(ex: RequestExample): string {
    const path = ex.path.replace(/\{(\w+)\}/g, (_, k: string) => ex.pathValues?.[k] ?? `{${k}}`);
    const query = ex.query ? `?${new URLSearchParams(ex.query).toString()}` : "";
    return `${path}${query}`;
}

const pad = (n: number) => " ".repeat(n);

/** Literal Python (True/False/None, dict 4 khoảng trắng) từ giá trị JSON. */
export function toPython(value: unknown, indent = 0): string {
    if (value === null || value === undefined) return "None";
    if (typeof value === "boolean") return value ? "True" : "False";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return JSON.stringify(value);
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return `[\n${value.map((v) => `${pad(indent + 4)}${toPython(v, indent + 4)}`).join(",\n")},\n${pad(indent)}]`;
    }
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([k, v]) => `${pad(indent + 4)}${JSON.stringify(k)}: ${toPython(v, indent + 4)}`).join(",\n")},\n${pad(indent)}}`;
}

/** Literal JS (khoá không ngoặc khi hợp lệ, 2 khoảng trắng) từ giá trị JSON. */
export function toJs(value: unknown, indent = 0): string {
    if (value === null || value === undefined) return "null";
    if (typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return `[\n${value.map((v) => `${pad(indent + 2)}${toJs(v, indent + 2)}`).join(",\n")},\n${pad(indent)}]`;
    }
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([k, v]) => `${pad(indent + 2)}${IDENT.test(k) ? k : JSON.stringify(k)}: ${toJs(v, indent + 2)}`).join(",\n")},\n${pad(indent)}}`;
}

function curl(ex: RequestExample): string {
    const url = `${API_BASE}${resolvePath(ex)}`;
    const lines = [ex.method === "GET" ? `curl ${url}` : `curl -X ${ex.method} ${url}`, `-H "X-API-Key: $${KEY_ENV}"`];
    for (const [k, v] of Object.entries(ex.headers ?? {})) lines.push(`-H "${k}: ${v}"`);
    if (ex.files) for (const [field, file] of Object.entries(ex.files)) lines.push(`-F "${field}=@${file}"`);
    else if (ex.body !== undefined) {
        lines.push(`-H "Content-Type: application/json"`);
        lines.push(`-d '${JSON.stringify(ex.body, null, 2).replace(/'/g, "'\\''")}'`);
    }
    return lines.join(" \\\n  ");
}

function python(ex: RequestExample): string {
    const headers = { "X-API-Key": "__KEY__", ...ex.headers };
    const args = [JSON.stringify(`${API_BASE}${resolvePath(ex)}`), `headers=${toPython(headers, 4).replace('"__KEY__"', `os.environ["${KEY_ENV}"]`)}`];
    if (ex.files) args.push(`files=[\n${Object.entries(ex.files).map(([f, file]) => `        (${JSON.stringify(f)}, open(${JSON.stringify(file)}, "rb")),`).join("\n")}\n    ]`);
    else if (ex.body !== undefined) args.push(`json=${toPython(ex.body, 4)}`);
    return [
        "import os",
        "import requests",
        "",
        `resp = requests.${ex.method.toLowerCase()}(`,
        ...args.map((a) => `    ${a},`),
        ")",
        "resp.raise_for_status()",
        "print(resp.json())",
    ].join("\n");
}

function node(ex: RequestExample): string {
    const url = `"${API_BASE}${resolvePath(ex)}"`;
    const headerEntries = [`"X-API-Key": process.env.${KEY_ENV}`, ...Object.entries(ex.headers ?? {}).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)];
    const pre: string[] = [];
    let body: string | null = null;
    if (ex.files) {
        pre.push('import { openAsBlob } from "node:fs";', "", "const form = new FormData();");
        for (const [f, file] of Object.entries(ex.files)) pre.push(`form.append(${JSON.stringify(f)}, await openAsBlob(${JSON.stringify(file)}), ${JSON.stringify(file)});`);
        pre.push("");
        body = "form";
    } else if (ex.body !== undefined) {
        headerEntries.push('"Content-Type": "application/json"');
        body = `JSON.stringify(${toJs(ex.body, 2)})`;
    }
    const opts = [
        ...(ex.method === "GET" ? [] : [`method: "${ex.method}"`]),
        `headers: {\n    ${headerEntries.join(",\n    ")},\n  }`,
        ...(body ? [`body: ${body}`] : []),
    ];
    return [...pre, `const res = await fetch(${url}, {`, ...opts.map((o) => `  ${o},`), "});", "if (!res.ok) throw new Error(`HTTP ${res.status}`);", "console.log(await res.json());"].join("\n");
}

export function codeSamples(ex: RequestExample): CodeSamples {
    return { curl: curl(ex), python: python(ex), node: node(ex) };
}
