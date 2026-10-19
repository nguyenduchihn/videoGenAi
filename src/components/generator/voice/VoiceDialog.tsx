import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Modal } from "@/components/ui";
import { GENDER_LABEL, matchesVoiceQuery, voiceName, voiceSummary } from "@/features/generator/voiceLabels";
import type { VoiceGender, VoicePreset } from "@/types/api";
import type { VoiceSample } from "./useVoiceSample";
import { SampleButton, VoiceListStatus, VoiceOption } from "./VoiceParts";

type GenderFilter = "all" | VoiceGender;

const FILTERS: ReadonlyArray<{ value: GenderFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "female", label: GENDER_LABEL.female },
    { value: "male", label: GENDER_LABEL.male },
    { value: "neutral", label: GENDER_LABEL.neutral },
];

export const NONE_LABEL = "Không chọn — AI tự chọn giọng";

interface VoiceDialogProps {
    open: boolean;
    /** Giọng đang dùng lúc mở popup; "" = không chọn. */
    initial: string;
    voices: readonly VoicePreset[] | undefined;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    sample: VoiceSample;
    onConfirm: (voice: string) => void;
    onClose: () => void;
}

/** Popup chọn giọng: lọc, tìm, nghe thử; chỉ áp dụng khi bấm "Chọn giọng này" (Huỷ / Esc giữ giọng cũ). */
export default function VoiceDialog({ open, initial, voices, isLoading, isError, onRetry, sample, onConfirm, onClose }: VoiceDialogProps) {
    return (
        <Modal open={open} onClose={onClose} title="Chọn giọng nói" description="Nghe thử rồi chọn một giọng dùng cho mọi video trong lượt." size="lg" className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            {/* Mount lại mỗi lần mở ⇒ lựa chọn tạm, bộ lọc và ô tìm bắt đầu từ giọng đang dùng */}
            {open && <VoiceDialogBody initial={initial} voices={voices} isLoading={isLoading} isError={isError} onRetry={onRetry} sample={sample} onConfirm={onConfirm} onClose={onClose} />}
        </Modal>
    );
}

function VoiceDialogBody({ initial, voices, isLoading, isError, onRetry, sample, onConfirm, onClose }: Omit<VoiceDialogProps, "open">) {
    const [pending, setPending] = useState(initial);
    const [filter, setFilter] = useState<GenderFilter>("all");
    const [query, setQuery] = useState("");
    const groupName = useId();

    const visible = useMemo(
        () => (voices ?? []).filter((v) => (filter === "all" || v.gender === filter) && matchesVoiceQuery(v, query)),
        [voices, filter, query],
    );
    const confirmLabel = pending ? `Chọn giọng ${voiceName(pending, voices)}` : "Không dùng giọng";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                <div role="group" aria-label="Lọc theo giới tính" className="flex flex-wrap gap-1.5 text-xs">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            aria-pressed={filter === f.value}
                            onClick={() => setFilter(f.value)}
                            className={`min-h-11 rounded-full px-3.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 sm:min-h-9 ${filter === f.value ? "bg-[var(--app-accent)] text-[var(--app-accent-fg)]" : "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-secondary)] hover:text-[var(--app-text)]"}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <label className="relative block text-xs">
                    <span className="sr-only">Tìm giọng</span>
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-text-muted)]" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm: ấm, trầm, Kore…"
                        className="h-11 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-8 pr-2 text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] sm:h-9"
                    />
                </label>
            </div>

            <fieldset className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-2">
                <legend className="sr-only">Giọng nói</legend>
                <ul role="list" className="max-h-[min(22rem,40dvh)] space-y-1 overflow-y-auto overscroll-contain pr-1">
                    <li className="flex items-center">
                        <VoiceOption name={groupName} checked={!pending} onSelect={() => setPending("")} title={NONE_LABEL} subtitle="Google tự chọn giọng hợp với nhân vật" />
                    </li>
                    {visible.map((voice) => (
                        <li key={voice.id} className="flex items-center gap-1.5">
                            <VoiceOption name={groupName} checked={pending === voice.id} onSelect={() => setPending(voice.id)} title={voice.name} subtitle={voiceSummary(voice)} />
                            <SampleButton voice={voice} sample={sample} compact />
                        </li>
                    ))}
                </ul>
                <VoiceListStatus isLoading={isLoading} isError={isError} isEmpty={Boolean(voices) && visible.length === 0} onRetry={onRetry} />
            </fieldset>

            <p className="text-[11px] leading-5 text-[var(--app-text-muted)]">
                Giọng chỉ quyết định chất giọng — lời thoại vẫn viết trong prompt, vd: Cô gái nói: "Xin chào các bạn".
            </p>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--app-border)] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="h-11 rounded-xl border border-[var(--app-border)] px-4 text-sm font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] sm:h-10">
                    <span className="text-sm">Huỷ</span>
                </button>
                <button type="button" onClick={() => onConfirm(pending)} className="h-11 rounded-xl bg-[var(--app-accent)] px-5 font-semibold text-[var(--app-accent-fg)] transition hover:bg-[var(--app-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40 sm:h-10">
                    <span className="text-sm">{confirmLabel}</span>
                </button>
            </div>
        </div>
    );
}
