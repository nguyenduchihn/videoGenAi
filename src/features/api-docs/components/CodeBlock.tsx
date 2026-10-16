import { highlight, type Lang } from "@/pages/home/sections/highlight";
import type { CodeLang } from "../content/types";

const toLang = (lang: CodeLang): Lang => (lang === "json" ? "js" : lang);

interface CodeBlockProps {
    code: string;
    lang: CodeLang;
    label: string;
    id?: string;
}

/** Khối code nền tối, cuộn ngang trong khung (360px không tràn trang), tab được để cuộn bằng bàn phím. role=group (không phải region) ⇒ không thêm ~20 landmark. */
export function CodeBlock({ code, lang, label, id }: CodeBlockProps) {
    return (
        <pre id={id} className="docs-terminal m-0 max-h-[32rem] overflow-auto p-4" tabIndex={0} role="group" aria-label={label}>
            <code>
                {highlight(code, toLang(lang)).map((line, i) => (
                    <span key={i} className="block min-h-[1.7em] whitespace-pre">
                        {line.map((seg, j) => (seg.kind ? <span key={j} className={`tok-${seg.kind}`}>{seg.text}</span> : <span key={j}>{seg.text}</span>))}
                    </span>
                ))}
            </code>
        </pre>
    );
}
