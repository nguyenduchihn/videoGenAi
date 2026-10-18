import "./api-docs.css";
import { Download, FileJson, FileText, Mail, Workflow } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { nextTabIndex } from "@/components/runs/rovingTabs";
import { useMe } from "@/hooks/useMe";
import { ConfigTab } from "./components/ConfigTab";
import { DocSectionView } from "./components/BlockView";
import { DocsHeader } from "./components/DocsHeader";
import { DocsTocNav, DocsTocSelect } from "./components/DocsToc";
import { scrollToSection } from "./hooks/scrollToSection";
import { API_BASE, DOCS_UPDATED, REFERENCE_URL, SUPPORT_EMAIL } from "./content/constants";
import { SECTIONS } from "./content/sections";
import { useScrollSpy } from "./hooks/useScrollSpy";

type DocsTab = "docs" | "config";
const TABS: Array<{ id: DocsTab; label: string }> = [
    { id: "docs", label: "Tài liệu API" },
    { id: "config", label: "Cấu hình API key & Webhook" },
];
const TOC = SECTIONS.map((s) => ({ id: s.id, title: s.title }));
const DOWNLOADS = [
    { href: "/api-docs.md", label: ".md", icon: FileText, title: "Tải tài liệu dạng Markdown", download: "videogen-ai-api.md" },
    { href: "/docs/json", label: "OpenAPI", icon: FileJson, title: "Tải đặc tả OpenAPI 3 (JSON)", download: "videogen-ai-openapi.json" },
    { href: "/docs/postman.json", label: "Postman", icon: Workflow, title: "Tải Postman collection", download: "videogen-ai.postman_collection.json" },
];

/** Khách chưa đăng nhập nhận 401 (bình thường) ⇒ trang vẫn công khai; có phiên ⇒ mục Xác thực, Giới hạn, tab Cấu hình cá nhân hoá. */
function SessionProbe() {
    useMe();
    return null;
}

export default function ApiDocsPage() {
    const [params, setParams] = useSearchParams();
    const tab: DocsTab = params.get("tab") === "config" ? "config" : "docs";
    const active = useScrollSpy(TOC.map((t) => t.id), tab === "docs");
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useEffect(() => {
        document.title = "Tài liệu API · VideoGen AI";
    }, []);

    // Mở link có #muc ⇒ nhảy tới mục sau khi trang lazy đã render.
    useEffect(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (tab === "docs" && id && document.getElementById(id)) scrollToSection(id, { instant: true });
    }, [tab]);

    const selectTab = (next: DocsTab) => setParams(next === "docs" ? {} : { tab: next }, { replace: true });
    const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
        const next = nextTabIndex(e.key, i, TABS.length);
        if (next === null) return;
        e.preventDefault();
        selectTab(TABS[next]!.id);
        tabRefs.current[next]?.focus();
    };

    return (
        <div className="api-docs min-h-screen bg-app-bg text-app-text">
            <SessionProbe />
            <DocsHeader />

            <div className="relative overflow-hidden border-b border-app-border bg-app-surface">
                <div className="docs-grid-bg pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-[1400px] px-4 pt-10 sm:pt-14 lg:px-8">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-app-accent">REST · v1 · OpenAPI 3</p>
                    <h1 className="docs-display mt-3 text-4xl font-bold leading-[1.05] text-app-text sm:text-5xl">Tài liệu API</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-app-text-secondary sm:text-lg">
                        Tạo video và ảnh bằng REST API. Xác thực bằng API key, gửi tối đa 20 job mỗi request, nhận kết quả qua poll hoặc webhook.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <code className="rounded-lg border border-app-border bg-app-bg px-3 py-1.5 font-mono text-[13px] text-app-text">{API_BASE}/v1</code>
                        {DOWNLOADS.map(({ href, label, icon: Icon, title, download }) => (
                            <a key={href} href={href} download={download} title={title} className="inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-bg px-3 py-1.5 text-[13px] font-medium text-app-text-secondary transition hover:border-app-accent/40 hover:text-app-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent">
                                <Icon className="h-3.5 w-3.5" aria-hidden />
                                {label}
                                <Download className="h-3 w-3 opacity-60" aria-hidden />
                            </a>
                        ))}
                    </div>
                    <div role="tablist" aria-label="Phần tài liệu" className="mt-8 flex gap-1 overflow-x-auto text-[13px] sm:text-sm">
                        {TABS.map((t, i) => {
                            const selected = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    ref={(el) => { tabRefs.current[i] = el; }}
                                    type="button"
                                    role="tab"
                                    id={`docs-tab-${t.id}`}
                                    aria-selected={selected}
                                    aria-controls={`docs-panel-${t.id}`}
                                    tabIndex={selected ? 0 : -1}
                                    onClick={() => selectTab(t.id)}
                                    onKeyDown={(e) => onTabKey(e, i)}
                                    className={`shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-app-accent sm:px-4 ${selected ? "border-app-accent text-app-text" : "border-transparent text-app-text-secondary hover:text-app-text"}`}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {tab === "docs" ? (
                <div id="docs-panel-docs" role="tabpanel" aria-labelledby="docs-tab-docs">
                    <DocsTocSelect items={TOC} active={active} />
                    <div className="mx-auto flex max-w-[1400px] gap-12 px-4 pb-24 pt-10 lg:px-8">
                        <DocsTocNav items={TOC} active={active} />
                        <main className="min-w-0 max-w-[52rem] flex-1 space-y-14">
                            {SECTIONS.map((s, i) => <DocSectionView key={s.id} section={s} index={i} />)}
                        </main>
                    </div>
                </div>
            ) : (
                <div id="docs-panel-config" role="tabpanel" aria-labelledby="docs-tab-config">
                    <main className="px-4 py-12 lg:px-8">
                        <ConfigTab />
                    </main>
                </div>
            )}

            <footer className="border-t border-app-border bg-app-surface">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-8 text-sm text-app-text-secondary sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>Cập nhật {DOCS_UPDATED} · <a href={REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-app-text hover:text-app-accent">Tham chiếu đầy đủ (OpenAPI)</a></p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 font-medium text-app-text hover:text-app-accent"><Mail className="h-4 w-4" aria-hidden />{SUPPORT_EMAIL}</a>
                </div>
            </footer>
        </div>
    );
}
