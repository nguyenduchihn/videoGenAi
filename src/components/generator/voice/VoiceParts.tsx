import { AlertCircle, Pause, Play } from "lucide-react";

import type { VoicePreset } from "@/types/api";
import type { VoiceSample } from "./useVoiceSample";

interface VoiceOptionProps {
    name: string;
    checked: boolean;
    onSelect: () => void;
    title: string;
    subtitle: string;
}

export function VoiceOption({ name, checked, onSelect, title, subtitle }: VoiceOptionProps) {
    return (
        <label
            className={`relative flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--app-accent)]/40 ${checked ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]" : "border-transparent hover:bg-[var(--app-surface)]"}`}
        >
            <input type="radio" name={name} checked={checked} onChange={onSelect} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-[var(--app-accent)]" : "border-[var(--app-border)]"}`}>
                {checked && <span className="h-2 w-2 rounded-full bg-[var(--app-accent)]" />}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[var(--app-text)]">{title}</span>
                <span className="block truncate text-xs text-[var(--app-text-muted)]">{subtitle}</span>
            </span>
        </label>
    );
}

export function SampleButton({ voice, sample, compact = false }: { voice: VoicePreset; sample: VoiceSample; compact?: boolean }) {
    const playing = sample.playingId === voice.id;
    const failed = sample.failedId === voice.id;
    const label = failed ? `Không phát được mẫu giọng ${voice.name}, thử lại` : playing ? `Dừng nghe thử ${voice.name}` : `Nghe thử giọng ${voice.name}`;
    const Icon = failed ? AlertCircle : playing ? Pause : Play;
    return (
        <button
            type="button"
            onClick={() => sample.toggle(voice.id, voice.sampleUrl)}
            aria-label={label}
            aria-pressed={playing}
            title={label}
            className={`flex shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 ${compact ? "h-11 w-11" : "min-h-12 w-12"} ${playing ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-accent)]" : failed ? "border-[var(--app-danger)]/40 text-[var(--app-danger)]" : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-accent)]"}`}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}

export function VoiceListStatus({ isLoading, isError, isEmpty, onRetry }: { isLoading: boolean; isError: boolean; isEmpty: boolean; onRetry: () => void }) {
    if (isLoading) return <p role="status" className="px-3 py-4 text-center text-xs text-[var(--app-text-muted)]">Đang tải danh sách giọng…</p>;
    if (isError) {
        return (
            <p role="alert" className="px-3 py-4 text-center text-xs text-[var(--app-danger)]">
                Không tải được danh sách giọng.{" "}
                <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">Thử lại</button>
            </p>
        );
    }
    if (isEmpty) return <p role="status" className="px-3 py-4 text-center text-xs text-[var(--app-text-muted)]">Không có giọng khớp bộ lọc.</p>;
    return null;
}
