import { describe, expect, it } from "vitest";
import { codeSamples, KEY_ENV, resolvePath, toJs, toPython } from "./codeSamples";

describe("codeSamples: một ví dụ ⇒ cURL / Python / Node khớp nhau", () => {
    const post = { method: "POST" as const, path: "/v1/tasks", headers: { "Idempotency-Key": "abc-12345" }, body: { tasks: [{ worker: "text-to-video", params: { prompt: "It's ok", audioEnabled: false } }], webhookUrl: null } };

    it("cURL: -X POST, key từ biến môi trường, body JSON thoát dấu nháy đơn", () => {
        const { curl } = codeSamples(post);
        expect(curl).toContain("curl -X POST https://api.aiveo3.org/v1/tasks");
        expect(curl).toContain(`-H "X-API-Key: $${KEY_ENV}"`);
        expect(curl).toContain('-H "Idempotency-Key: abc-12345"');
        expect(curl).toContain("It'\\''s ok");
    });

    it("Python: requests.post, literal True/False/None, key từ os.environ", () => {
        const { python } = codeSamples(post);
        expect(python).toContain("resp = requests.post(");
        expect(python).toContain(`os.environ["${KEY_ENV}"]`);
        expect(python).toContain('"audioEnabled": False');
        expect(python).toContain('"webhookUrl": None');
    });

    it("Node: fetch có method + Content-Type, khoá JS không ngoặc khi hợp lệ", () => {
        const { node } = codeSamples(post);
        expect(node).toContain('method: "POST"');
        expect(node).toContain('"Content-Type": "application/json"');
        expect(node).toContain(`process.env.${KEY_ENV}`);
        expect(node).toContain("worker: \"text-to-video\"");
    });

    it("GET: không -X, không body; thay tham số đường dẫn + query", () => {
        const ex = { method: "GET" as const, path: "/v1/batches/{batchId}", pathValues: { batchId: "b_1" }, query: { limit: "5" } };
        expect(resolvePath(ex)).toBe("/v1/batches/b_1?limit=5");
        const s = codeSamples(ex);
        expect(s.curl.startsWith("curl https://api.aiveo3.org/v1/batches/b_1?limit=5")).toBe(true);
        expect(s.curl).not.toContain("-d '");
        expect(s.node).not.toContain("method:");
        expect(s.python).toContain("requests.get(");
    });

    it("multipart: -F ở cURL, files= ở Python, FormData + openAsBlob ở Node", () => {
        const s = codeSamples({ method: "POST", path: "/v1/images", files: { start: "start.png" } });
        expect(s.curl).toContain('-F "start=@start.png"');
        expect(s.python).toContain('("start", open("start.png", "rb"))');
        expect(s.node).toContain('form.append("start", await openAsBlob("start.png"), "start.png");');
        expect(s.node).not.toContain("Content-Type");
    });

    it("toPython / toJs: mảng, object rỗng, khoá có ký tự đặc biệt", () => {
        expect(toPython({ a: [], b: {}, c: [1, true] })).toBe('{\n    "a": [],\n    "b": {},\n    "c": [\n        1,\n        True,\n    ],\n}');
        expect(toJs({ "Content-Type": "x", ok: 1 })).toBe('{\n  "Content-Type": "x",\n  ok: 1,\n}');
    });
});
