import { describe, expect, it } from "vitest";
import { renderLlmsTxt, renderMarkdown } from "./markdown";
import { SECTIONS } from "./sections";
import { WORKERS } from "./workers";

describe("api-docs.md / llms.txt sinh từ manifest", () => {
    const md = renderMarkdown();

    it("đủ mọi mục (tiêu đề + neo) và mọi worker", () => {
        for (const s of SECTIONS) {
            expect(md).toContain(`## ${s.title}`);
            expect(md).toContain(`<a id="${s.id}"></a>`);
        }
        for (const w of WORKERS) expect(md).toContain(`### \`${w.id}\``);
    });

    it("không còn link tương đối (AI agent đọc file .md tách khỏi website)", () => {
        expect(md).not.toMatch(/\]\(\//);
        expect(md).toContain("](https://aiveo3.org/settings/api-keys)");
        expect(md).toContain("](https://api.aiveo3.org/docs)");
    });

    it("widget sống ⇒ chữ dự phòng; code fence đóng mở cân bằng", () => {
        expect(md).toContain("GET /v1/me");
        expect((md.match(/```/g) ?? []).length % 2).toBe(0);
    });

    it("llms.txt: tiêu đề H1, tóm tắt blockquote, link tới từng mục + OpenAPI", () => {
        const txt = renderLlmsTxt();
        expect(txt.startsWith("# VideoGen AI API\n\n> ")).toBe(true);
        for (const s of SECTIONS) expect(txt).toContain(`(https://aiveo3.org/api-docs#${s.id})`);
        expect(txt).toContain("https://api.aiveo3.org/docs/json");
    });
});
