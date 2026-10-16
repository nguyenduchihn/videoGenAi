import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

const flat = (code: string, lang: Parameters<typeof highlight>[1]) => highlight(code, lang).flat();

describe("highlight — tô màu code mẫu bằng regex", () => {
    it("bash: comment, chuỗi, số và từ khoá curl được gắn kind; chữ thường không có kind", () => {
        const segs = flat(`curl -X POST https://x.test/v1/tasks # tạo lô\n  -H "X-API-Key: vk_1" 202`, "bash");
        expect(segs).toContainEqual({ text: "curl", kind: "kw" });
        expect(segs).toContainEqual({ text: "# tạo lô", kind: "cmt" });
        expect(segs).toContainEqual({ text: '"X-API-Key: vk_1"', kind: "str" });
        expect(segs).toContainEqual({ text: "202", kind: "num" });
        expect(segs.find((s) => s.text.includes("POST"))?.kind).toBeUndefined();
    });

    it("JSON: chuỗi đứng trước dấu hai chấm là khoá (key), còn lại là chuỗi (str)", () => {
        const segs = flat(`{ "worker": "text-to-video", "credits": 5 }`, "js");
        expect(segs).toContainEqual({ text: '"worker"', kind: "key" });
        expect(segs).toContainEqual({ text: '"text-to-video"', kind: "str" });
        expect(segs).toContainEqual({ text: "5", kind: "num" });
    });

    it("js: // là comment tới cuối dòng và không bắt // trong chuỗi URL", () => {
        const segs = flat(`const r = await fetch("https://a.b/x"); // gọi`, "js");
        expect(segs).toContainEqual({ text: '"https://a.b/x"', kind: "str" });
        expect(segs).toContainEqual({ text: "// gọi", kind: "cmt" });
        expect(segs).toContainEqual({ text: "const", kind: "kw" });
    });

    it("ghép lại các đoạn ra đúng mã gốc (không mất ký tự)", () => {
        const code = `import httpx, os\nr = httpx.post("u", json={"a": 1})  # x`;
        expect(highlight(code, "python").map((l) => l.map((s) => s.text).join("")).join("\n")).toBe(code);
    });
});
