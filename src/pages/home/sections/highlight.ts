export type Lang = "bash" | "js" | "python";
export type TokenKind = "key" | "str" | "num" | "cmt" | "kw";
export interface Segment {
    text: string;
    kind?: TokenKind;
}

const KEYWORDS: Record<Lang, readonly string[]> = {
    bash: ["curl"],
    js: ["const", "await", "fetch", "import", "from", "export", "return", "async"],
    python: ["import", "from", "as", "def", "return", "print"],
};
const COMMENT_MARK: Record<Lang, string> = { bash: "#", js: "//", python: "#" };
const STRING = /"[^"\n]*"|'[^'\n]*'/g;
const NUMBER = /\b\d+(?:\.\d+)?\b/g;

/** Vị trí bắt đầu comment NGOÀI chuỗi (bỏ qua `//` trong URL, `#` trong chuỗi); -1 nếu không có. */
function findComment(line: string, lang: Lang): number {
    const mark = COMMENT_MARK[lang];
    let quote: string | null = null;
    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i]!;
        if (quote) {
            if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'") {
            quote = ch;
        } else if (line.startsWith(mark, i)) {
            return i;
        }
    }
    return -1;
}

/** Tô màu một dòng code bằng regex đơn giản (comment → chuỗi → số → từ khoá); không thư viện highlight. */
function highlightLine(line: string, lang: Lang): Segment[] {
    const commentAt = findComment(line, lang);
    const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
    const comment = commentAt >= 0 ? line.slice(commentAt) : "";
    const out: Segment[] = [];
    let last = 0;
    const push = (text: string, kind?: TokenKind) => { if (text) out.push(kind ? { text, kind } : { text }); };
    const pushPlain = (text: string) => {
        // từ khoá + số trong phần không phải chuỗi
        const re = new RegExp(`\\b(${KEYWORDS[lang].join("|")})\\b|${NUMBER.source}`, "g");
        let i = 0;
        for (const m of text.matchAll(re)) {
            push(text.slice(i, m.index));
            push(m[0], m[1] ? "kw" : "num");
            i = m.index + m[0].length;
        }
        push(text.slice(i));
    };
    for (const m of code.matchAll(STRING)) {
        pushPlain(code.slice(last, m.index));
        const isKey = /^\s*:/.test(code.slice(m.index + m[0].length)); // "field": ⇒ khoá JSON
        push(m[0], isKey ? "key" : "str");
        last = m.index + m[0].length;
    }
    pushPlain(code.slice(last));
    push(comment, "cmt");
    return out;
}

export function highlight(code: string, lang: Lang): Segment[][] {
    return code.split("\n").map((line) => highlightLine(line, lang));
}
