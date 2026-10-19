import { useEffect, useId, useMemo, useState } from "react";
import { AlertCircle, ChevronDown, Mic, Pause, Play, Search } from "lucide-react";

import { useVoices } from "@/hooks/useVoices";
import { GENDER_LABEL, matchesVoiceQuery, voiceName, voiceSummary } from "@/features/generator/voiceLabels";
import type { VoiceGender, VoicePreset } from "@/types/api";
import { useVoiceSample, type VoiceSample } from "./useVoiceSample";

type GenderFilter = "all" | VoiceGender;

const FILTERS: ReadonlyArray<{ value: GenderFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "female", label: GENDER_LABEL.female },
    { value: "male", label: GENDER_LABEL.male },
    { value: "neutral", label: GENDER_LABEL.neutral },
];

const NONE_LABEL = "Không chọn — AI tự chọn giọng";

interface VoicePickerProps {
    /** id giọng; "" = không chọn. */
    value: string;
    onChange: (voice: string) => void;
    audioEnabled: boolean;
    onEnableAudio: () => void;
}

export default function VoicePicker({ value, onChange, audioEnabled, onEnableAudio }: VoicePickerProps) {
    const { data: voices, isLoading, isError, refetch } = useVoices();
    const sample = useVoiceSample();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<GenderFilter>("all");
    const [query, setQuery] = useState("");
    const panelId = useId();
    const groupName = useId();

    const selected = voices?.find((v) => v.id === value);
    const visible = useMemo(
        () => (voices ?? []).filter((v) => (filter === "all" || v.gender === filter) && matchesVoiceQuery(v, query)),
        [voices, filter, query],
    );

    // Giọng nhớ từ lần trước không còn trong danh sách ⇒ bỏ chọn, tránh 400 lúc tạo.
    useEffect(() => {
        if (voices && value && !voices.some((v) => v.id === value)) onChange("");
    }, [voices, value, onChange]);

    const { stop } = sample;
    useEffect(() => {
        if (!open) stop();
    }, [open, stop]);

    const choose = (voice: string) => {
        onChange(voice);
        if (voice && !audioEnabled) onEnableAudio();
    };

    return (
        <div>
            <div className="flex items-stretch gap-2">
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={`${open ? "Thu gọn" : "Mở"} danh sách giọng — ${value ? `đang chọn ${voiceName(value, voices)}` : "chưa chọn"}`}
                    onClick={() => setOpen((v) => !v)}
                    className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-left transition hover:border-[var(--app-accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40"
                >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${value ? "bg-[var(--app-accent)] text-[var(--app-accent-fg)]" : "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]"}`}>
                        <Mic className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--app-text)]">
                            {value ? voiceName(value, voices) : NONE_LABEL}
                        </span>
                        {selected && <span className="block truncate text-xs text-[var(--app-text-muted)]">{voiceSummary(selected)}</span>}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--app-text-muted)] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {selected && <SampleButton voice={selected} sample={sample} />}
            </div>

            {value && !audioEnabled && (
                <p role="status" className="mt-2 flex items-start gap-1.5 text-xs text-[var(--app-warning)]">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>
                        Audio đang tắt nên giọng không có tác dụng.{" "}
                        <button type="button" onClick={onEnableAudio} className="font-semibold underline underline-offset-2">Bật audio</button>
                    </span>
                </p>
            )}

            <div id={panelId} role="group" aria-label="Chọn giọng nói" hidden={!open} className="mt-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div role="group" aria-label="Lọc theo giới tính" className="flex flex-wrap gap-1.5 text-xs">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                aria-pressed={filter === f.value}
                                onClick={() => setFilter(f.value)}
                                className={`min-h-11 rounded-full px-3.5 sm:min-h-9 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 ${filter === f.value ? "bg-[var(--app-accent)] text-[var(--app-accent-fg)]" : "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text)]"}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <label className="relative block text-xs sm:ml-auto sm:w-48">
                        <span className="sr-only">Tìm giọng</span>
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-text-muted)]" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm: ấm, trầm, Kore…"
                            className="h-11 w-full rounded-lg border sm:h-9 border-[var(--app-border)] bg-[var(--app-surface)] pl-8 pr-2 text-xs text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
                        />
                    </label>
                </div>

                <fieldset className="mt-3">
                    <legend className="sr-only">Giọng nói</legend>
                    <ul role="list" className="max-h-72 space-y-1 overflow-y-auto overscroll-contain pr-1">
                        <li className="flex items-center">
                            <VoiceOption name={groupName} checked={!value} onSelect={() => choose("")} title={NONE_LABEL} subtitle="Google tự chọn giọng hợp với nhân vật" />
                        </li>
                        {visible.map((voice) => (
                            <li key={voice.id} className="flex items-center gap-1.5">
                                <VoiceOption name={groupName} checked={value === voice.id} onSelect={() => choose(voice.id)} title={voice.name} subtitle={voiceSummary(voice)} />
                                <SampleButton voice={voice} sample={sample} compact />
                            </li>
                        ))}
                    </ul>
                    <VoiceListStatus isLoading={isLoading} isError={isError} isEmpty={Boolean(voices) && visible.length === 0} onRetry={() => void refetch()} />
                </fieldset>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[var(--app-text-muted)]">
                Cùng một giọng cho mọi video trong lượt. Giọng chỉ quyết định chất giọng — lời thoại vẫn viết trong prompt, vd: Cô gái nói: "Xin chào các bạn".
            </p>
        </div>
    );
}

interface VoiceOptionProps {
    name: string;
    checked: boolean;
    onSelect: () => void;
    title: string;
    subtitle: string;
}

function VoiceOption({ name, checked, onSelect, title, subtitle }: VoiceOptionProps) {
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

function SampleButton({ voice, sample, compact = false }: { voice: VoicePreset; sample: VoiceSample; compact?: boolean }) {
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

function VoiceListStatus({ isLoading, isError, isEmpty, onRetry }: { isLoading: boolean; isError: boolean; isEmpty: boolean; onRetry: () => void }) {
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
