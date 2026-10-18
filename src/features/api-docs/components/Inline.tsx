import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Inline as InlineText } from "../content/types";

// `code`, **đậm**, [chữ](url) — đủ cho manifest, không cần thư viện markdown.
const TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function DocLink({ href, children }: { href: string; children: ReactNode }) {
    const cls = "font-medium text-app-accent underline decoration-app-accent/30 underline-offset-2 transition hover:decoration-app-accent";
    if (href.startsWith("/") && !href.startsWith("/docs")) return <Link to={href} className={cls}>{children}</Link>;
    const external = /^https?:/.test(href);
    return <a href={href} className={cls} {...(external || href.startsWith("/docs") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

export function Inline({ text }: { text: InlineText }) {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of text.matchAll(TOKEN)) {
        if (m.index > last) out.push(text.slice(last, m.index));
        if (m[1] !== undefined) out.push(<code key={m.index} className="docs-inline-code">{m[1]}</code>);
        else if (m[2] !== undefined) out.push(<strong key={m.index} className="font-semibold text-app-text"><Inline text={m[2]} /></strong>);
        else out.push(<DocLink key={m.index} href={m[4]!}><Inline text={m[3]!} /></DocLink>);
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}
