import { useState, useCallback } from "react";

export const DRAFTS_KEY = "videogen_project_drafts";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface ProjectDraft {
    id: string;
    name: string;
    prompt: string;
    settings?: Record<string, unknown>;
    updatedAt: string;
}

function prune(drafts: ProjectDraft[]): ProjectDraft[] {
    const cutoff = Date.now() - TTL_MS;
    return drafts.filter((d) => new Date(d.updatedAt).getTime() > cutoff);
}

function load(): ProjectDraft[] {
    try {
        const raw = localStorage.getItem(DRAFTS_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return prune(parsed as ProjectDraft[]);
    } catch {
        return [];
    }
}

function persist(drafts: ProjectDraft[]): void {
    try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts)); } catch { /* quota */ }
}

export function readDraftPrompt(draftId: string): string {
    try {
        const raw = localStorage.getItem(DRAFTS_KEY);
        if (!raw) return "";
        return (JSON.parse(raw) as ProjectDraft[]).find((d) => d.id === draftId)?.prompt ?? "";
    } catch { return ""; }
}

export function persistDraftPrompt(draftId: string, prompt: string): void {
    try {
        const raw = localStorage.getItem(DRAFTS_KEY);
        const drafts: ProjectDraft[] = raw ? (JSON.parse(raw) as ProjectDraft[]) : [];
        const idx = drafts.findIndex((d) => d.id === draftId);
        if (idx >= 0) {
            drafts[idx] = { ...drafts[idx], prompt, updatedAt: new Date().toISOString() };
            persist(drafts);
        }
    } catch { /* ignore */ }
}

const DEFAULT_DRAFT: ProjectDraft = {
    id: "default-1",
    name: "Dự án 1",
    prompt: "",
    updatedAt: new Date().toISOString(),
};

export function useProjectDrafts() {
    const [drafts, setDrafts] = useState<ProjectDraft[]>(() => {
        const loaded = load();
        if (loaded.length === 0) { persist([DEFAULT_DRAFT]); return [DEFAULT_DRAFT]; }
        return loaded;
    });

    const create = useCallback((name: string): ProjectDraft => {
        const d: ProjectDraft = { id: `draft-${Date.now()}`, name, prompt: "", updatedAt: new Date().toISOString() };
        setDrafts((cur) => { const next = [d, ...cur]; persist(next); return next; });
        return d;
    }, []);

    const rename = useCallback((id: string, name: string): void => {
        setDrafts((cur) => {
            const next = cur.map((d) => d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d);
            persist(next); return next;
        });
    }, []);

    const remove = useCallback((id: string): void => {
        setDrafts((cur) => { const next = cur.filter((d) => d.id !== id); persist(next); return next; });
    }, []);

    const update = useCallback((id: string, patch: Partial<Omit<ProjectDraft, "id">>): void => {
        setDrafts((cur) => {
            const next = cur.map((d) => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d);
            persist(next); return next;
        });
    }, []);

    return { drafts, create, rename, remove, update };
}
