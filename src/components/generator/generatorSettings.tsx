import { Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ModelOption } from "@/features/generator/modelCatalog";
import { SEED_MAX, SEED_MIN, type ModeSpec } from "@/features/generator/modes";
import { ModelSelect } from "./settings/ModelSelect";
import { SplitModeSelect } from "./settings/SplitModeSelect";
import type { GeneratorSettingsState, PromptSplitMode } from "./types";

interface GeneratorSettingsProps {
    open: boolean;
    spec: ModeSpec;
    value: GeneratorSettingsState;
    splitMode: PromptSplitMode;
    onSplitModeChange: (value: PromptSplitMode) => void;
    onChange: (value: GeneratorSettingsState) => void;
    onClose: () => void;
    modelOptions: ModelOption[];
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
    return (
        <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-secondary)]">{title}</h3>
            {description && <p className="mt-1 text-xs text-[var(--app-text-muted)]">{description}</p>}
        </div>
    );
}

function ToggleField({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
            <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--app-text)]">{label}</p>
                {description && <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">{description}</p>}
            </div>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[var(--app-accent)]" : "bg-[var(--app-border)]"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
            </span>
        </button>
    );
}

function SeedField({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <label htmlFor="generator-seed" className="text-sm font-medium text-[var(--app-text)]">Seed</label>
                <p className="mt-0.5 text-xs leading-5 text-[var(--app-text-muted)]">Cùng seed + cùng prompt ⇒ ảnh gần giống nhau. Để trống để ngẫu nhiên.</p>
            </div>
            <input
                id="generator-seed"
                type="number"
                inputMode="numeric"
                min={SEED_MIN}
                max={SEED_MAX}
                value={value ?? ""}
                placeholder="Ngẫu nhiên"
                onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "") return onChange(null);
                    const next = Number(raw);
                    if (Number.isInteger(next)) onChange(next);
                }}
                className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)] sm:w-36"
            />
        </div>
    );
}

export default function GeneratorSettings({ open, spec, value, splitMode, onSplitModeChange, onChange, onClose, modelOptions }: GeneratorSettingsProps) {
    const [localValue, setLocalValue] = useState<GeneratorSettingsState>(value);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        closeButtonRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => { if (open) setLocalValue(value); }, [open, value]);

    if (!open) return null;

    const updateValue = (patch: Partial<GeneratorSettingsState>) => {
        const nextValue = { ...localValue, ...patch };
        setLocalValue(nextValue);
        onChange(nextValue);
    };

    const handleClose = () => {
        onChange(localValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}>
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--app-surface)] text-[var(--app-text)] transition-colors sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl sm:border sm:border-[var(--app-border)] sm:shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="generator-settings-title">
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--app-border)] px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                            <Settings className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 id="generator-settings-title" className="text-sm font-semibold text-[var(--app-text)]">Cài đặt nâng cao</h2>
                            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Model, audio, seed và cách tách prompt</p>
                        </div>
                    </div>
                    <button ref={closeButtonRef} type="button" onClick={handleClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]" aria-label="Đóng cài đặt">
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-6 p-4 sm:p-5">
                        <section>
                            <SectionHeading title="Model" description={spec.value === "start-end-image-to-video" ? "Veo 3.1 Omni không hỗ trợ Khung đầu + cuối nên không hiện ở đây." : undefined} />
                            <ModelSelect options={modelOptions} value={localValue.model} onChange={(model) => updateValue({ model })} />
                        </section>

                        {spec.settings.audio && (
                            <section className="border-t border-[var(--app-border)] pt-6">
                                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                                    <ToggleField label="Tạo audio cho video" description="Cho phép model tạo âm thanh cùng với video." checked={localValue.audioEnabled} onChange={(audioEnabled) => updateValue({ audioEnabled })} />
                                </div>
                            </section>
                        )}

                        {spec.settings.seed && (
                            <section className="border-t border-[var(--app-border)] pt-6">
                                <SectionHeading title="Seed" />
                                <SeedField value={localValue.seed} onChange={(seed) => updateValue({ seed })} />
                            </section>
                        )}

                        <section className="border-t border-[var(--app-border)] pt-6">
                            <SectionHeading title="Prompts" description="Chọn cách chia nội dung thành nhiều job." />
                            <SplitModeSelect value={splitMode} onChange={onSplitModeChange} customSeparator={localValue.customSeparator} onCustomSeparatorChange={(customSeparator) => updateValue({ customSeparator })} />
                        </section>

                        <p className="rounded-xl bg-[var(--app-surface-soft)] px-4 py-3 text-xs leading-5 text-[var(--app-text-muted)]">
                            Hệ thống tự điều phối số luồng; chỉ cần nhập nhiều prompt (mỗi dòng một job) và bấm Tạo.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-center text-[11px] text-[var(--app-text-muted)] sm:text-left">Thay đổi được áp dụng ngay vào Generator.</p>
                    <button type="button" onClick={handleClose} className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--app-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--app-accent-hover)] sm:w-auto">
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
}
