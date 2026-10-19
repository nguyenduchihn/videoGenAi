import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Mic } from "lucide-react";

import { useVoices } from "@/hooks/useVoices";
import { voiceName, voiceSummary } from "@/features/generator/voiceLabels";
import { useVoiceSample } from "./useVoiceSample";
import VoiceDialog, { NONE_LABEL } from "./VoiceDialog";
import { SampleButton } from "./VoiceParts";

interface VoicePickerProps {
    /** id giọng; "" = không chọn. */
    value: string;
    onChange: (voice: string) => void;
    audioEnabled: boolean;
    onEnableAudio: () => void;
}

/** Dòng gọn hiện giọng đang dùng (+ nghe thử); bấm ⇒ popup chọn giọng. */
export default function VoicePicker({ value, onChange, audioEnabled, onEnableAudio }: VoicePickerProps) {
    const { data: voices, isLoading, isError, refetch } = useVoices();
    const sample = useVoiceSample();
    const [open, setOpen] = useState(false);
    const selected = voices?.find((v) => v.id === value);

    // Giọng nhớ từ lần trước không còn trong danh sách ⇒ bỏ chọn, tránh 400 lúc tạo.
    useEffect(() => {
        if (voices && value && !voices.some((v) => v.id === value)) onChange("");
    }, [voices, value, onChange]);

    const close = () => {
        sample.stop();
        setOpen(false);
    };
    const confirm = (voice: string) => {
        onChange(voice);
        if (voice && !audioEnabled) onEnableAudio();
        close();
    };

    return (
        <div>
            <div className="flex items-stretch gap-2">
                <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`Chọn giọng nói — ${value ? `đang dùng ${voiceName(value, voices)}` : "chưa chọn"}`}
                    onClick={() => setOpen(true)}
                    className="group flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-left transition hover:border-[var(--app-accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/40"
                >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${value ? "bg-[var(--app-accent)] text-[var(--app-accent-fg)]" : "bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]"}`}>
                        <Mic className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--app-text)]">{value ? voiceName(value, voices) : NONE_LABEL}</span>
                        {selected && <span className="block truncate text-xs text-[var(--app-text-muted)]">{voiceSummary(selected)}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--app-accent)]">
                        {value ? "Đổi" : "Chọn giọng"}
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                </button>
                {selected && !open && <SampleButton voice={selected} sample={sample} />}
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

            <p className="mt-2 text-[11px] leading-5 text-[var(--app-text-muted)]">Cùng một giọng cho mọi video trong lượt.</p>

            <VoiceDialog
                open={open}
                initial={value}
                voices={voices}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => void refetch()}
                sample={sample}
                onConfirm={confirm}
                onClose={close}
            />
        </div>
    );
}
