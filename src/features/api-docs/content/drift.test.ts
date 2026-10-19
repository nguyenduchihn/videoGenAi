import { describe, expect, it } from "vitest";
import Ajv from "ajv";
import specRaw from "../../../../docs/integrator.json?raw";
import { SECTIONS } from "./sections";
import type { HttpMethod, RequestExample } from "./types";
import { WORKER_IDS, WORKERS } from "./workers";

// Tài liệu không được lệch API thật: đối chiếu manifest với docs/integrator.json (npm run sync:api chép từ backend).
type Schema = Record<string, unknown>;
interface Spec { paths: Record<string, Record<string, { requestBody?: { content?: Record<string, { schema?: Schema }> } }>>; components?: { schemas?: Record<string, Schema> } }

const spec = JSON.parse(specRaw) as Spec;

const endpoints: Array<{ method: HttpMethod; path: string }> = [];
const requests: RequestExample[] = WORKERS.map((w) => w.example);
for (const s of SECTIONS) for (const b of s.blocks) {
    if (b.kind === "endpoint") endpoints.push({ method: b.method, path: b.path });
    if (b.kind === "request") requests.push(b.example);
}
for (const r of requests) endpoints.push({ method: r.method, path: r.path });

/** OpenAPI 3.0 `nullable` ⇒ JSON Schema type mảng có "null" (ajv không hiểu nullable). */
function toJsonSchema(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(toJsonSchema);
    if (!node || typeof node !== "object") return node;
    const { nullable, ...rest } = node as Schema;
    const out = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, k === "$ref" ? String(v).replace("#/components/schemas/", "#/definitions/") : toJsonSchema(v)]));
    if (nullable === true && typeof out.type === "string") out.type = [out.type, "null"];
    if (nullable === true && !out.type) return { anyOf: [out, { type: "null" }] };
    return out;
}

describe("Tài liệu khớp spec bên tích hợp (docs/integrator.json)", () => {
    it.each(endpoints.map((e) => [`${e.method} ${e.path}`, e] as const))("%s có trong spec", (_, e) => {
        expect(spec.paths[e.path]?.[e.method.toLowerCase()]).toBeDefined();
    });

    it("các worker frontend sử dụng đều hợp lệ theo enum `worker` của POST /v1/tasks", () => {
        const body = spec.paths["/v1/tasks"]!.post!.requestBody!.content!["application/json"]!.schema!;
        const json = JSON.stringify(body);
        const enumMatch = /"worker":\{[^}]*"enum":(\[[^\]]+\])/.exec(json) ?? /"worker":\{"type":"string","enum":(\[[^\]]+\])/.exec(JSON.stringify(spec.components ?? {}));
        expect(enumMatch).not.toBeNull();
        const apiWorkerIds = JSON.parse(enumMatch![1]!) as string[];

        expect(apiWorkerIds).toContain("extend-video");
        expect(apiWorkerIds).toEqual(expect.arrayContaining(WORKER_IDS));
        expect(WORKER_IDS).not.toContain("extend-video");
    });

    const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false });
    const definitions = toJsonSchema(spec.components?.schemas ?? {}) as Record<string, unknown>;
    const withBody = requests.filter((r) => r.body !== undefined);

    it.each(withBody.map((r, i) => [`${r.method} ${r.path} #${i}`, r] as const))("body ví dụ %s hợp lệ theo schema", (_, r) => {
        const schema = spec.paths[r.path]![r.method.toLowerCase()]!.requestBody?.content?.["application/json"]?.schema;
        expect(schema).toBeDefined();
        const validate = ajv.compile({ ...(toJsonSchema(schema) as object), definitions });
        const ok = validate(r.body);
        expect(validate.errors ?? []).toEqual([]);
        expect(ok).toBe(true);
    });

    it("kiểm schema thật sự bắt lỗi (worker lạ, thiếu params) — test trên không pass vô điều kiện", () => {
        const schema = spec.paths["/v1/tasks"]!.post!.requestBody!.content!["application/json"]!.schema;
        const validate = ajv.compile({ ...(toJsonSchema(schema) as object), definitions });
        expect(validate({ tasks: [{ worker: "khong-co", params: { prompt: "x" } }] })).toBe(false);
        expect(validate({ tasks: [{ worker: "text-to-video" }] })).toBe(false);
    });
});
