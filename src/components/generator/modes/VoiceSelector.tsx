
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    AudioLines,
    Check,
    ChevronDown,
    Search,
    X,
} from "lucide-react";
import { VOICE_OPTIONS_INFO } from "../types";
import type { GeneratorAttachments } from "../types";

interface VoiceSelectorProps {
    value: GeneratorAttachments["voice"];
    onChange: (voice: string) => void;
}

export default function VoiceSelector({
    value,
    onChange,
}: VoiceSelectorProps) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const selectedVoice = VOICE_OPTIONS_INFO.find(
        (voice) => voice.id === value,
    );

    const filteredVoices = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return VOICE_OPTIONS_INFO;

        return VOICE_OPTIONS_INFO.filter(
            (voice) =>
                voice.id.toLowerCase().includes(keyword) ||
                voice.label.toLowerCase().includes(keyword) ||
                voice.description.toLowerCase().includes(keyword),
        );
    }, [search]);

    const updatePosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const shouldOpenUpward =
            spaceBelow < 360 && spaceAbove > spaceBelow;

        setOpenUpward(shouldOpenUpward);
        setPosition({
            top: shouldOpenUpward ? rect.top - 8 : rect.bottom + 8,
            left: rect.left,
            width: rect.width,
        });
    };

    const toggleDropdown = () => {
        if (!isOpen) updatePosition();
        setIsOpen((open) => !open);
    };

    const selectVoice = (voiceId: string) => {
        onChange(voiceId);
        setIsOpen(false);
        setSearch("");
    };

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (
                !triggerRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        const handleViewportChange = () => updatePosition();

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleViewportChange);
            window.removeEventListener("scroll", handleViewportChange, true);
        };
    }, [isOpen]);

    return (
        <div>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="flex w-full items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-left transition hover:border-[var(--app-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/30"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-accent)]">
                    <AudioLines size={20} />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--app-text)]">
                        {selectedVoice?.label ?? "Mặc định của model"}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                        {selectedVoice?.description ??
                            "Không chỉ định giọng nói riêng"}
                    </span>
                </span>

                {selectedVoice && (
                    <span className="rounded-md bg-[var(--app-surface-soft)] px-2 py-1 text-xs text-[var(--app-text-muted)]">
                        Đã chọn
                    </span>
                )}

                <ChevronDown
                    size={18}
                    className={`shrink-0 text-[var(--app-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen &&
                createPortal(
                    <div
                        ref={panelRef}
                        className="fixed z-[9999] flex flex-col overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
                        style={{
                            left: position.left,
                            width: position.width,
                            maxWidth: "calc(100vw - 24px)",
                            maxHeight: Math.max(
                                180,
                                Math.min(
                                    360,
                                    openUpward
                                        ? position.top - 16
                                        : window.innerHeight - position.top - 16,
                                ),
                            ),
                            ...(openUpward
                                ? { bottom: window.innerHeight - position.top }
                                : { top: position.top }),
                        }}
                    >
                        <div className="shrink-0 border-b border-[var(--app-border)] p-3">
                            <div className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3">
                                <Search
                                    size={17}
                                    className="shrink-0 text-[var(--app-text-muted)]"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Tìm tên hoặc mô tả giọng..."
                                    autoComplete="off"
                                    autoFocus
                                    className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Xóa tìm kiếm"
                                        className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                                {filteredVoices.length} giọng nói
                            </p>
                        </div>

                        <div
                            role="listbox"
                            aria-label="Danh sách giọng nói"
                            className="min-h-0 flex-1 overflow-y-auto p-2"
                        >
                            <button
                                type="button"
                                role="option"
                                aria-selected={!value}
                                onClick={() => selectVoice("")}
                                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[var(--app-surface-soft)] ${!value ? "bg-[var(--app-surface-soft)]" : ""
                                    }`}
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)]">
                                    <AudioLines size={17} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-[var(--app-text)]">
                                        Mặc định của model
                                    </span>
                                    <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                                        Không chỉ định voice ID
                                    </span>
                                </span>
                                {!value && (
                                    <Check
                                        size={17}
                                        className="text-[var(--app-accent)]"
                                    />
                                )}
                            </button>

                            {filteredVoices.map((voice) => {
                                const isSelected = value === voice.id;

                                return (
                                    <button
                                        key={voice.id}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => selectVoice(voice.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[var(--app-surface-soft)] ${isSelected
                                                ? "bg-[var(--app-surface-soft)]"
                                                : ""
                                            }`}
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-accent)]">
                                            <AudioLines size={17} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-[var(--app-text)]">
                                                {voice.label}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">
                                                {voice.description}
                                            </span>
                                            <span className="mt-1 block text-[11px] text-[var(--app-text-muted)]">
                                                ID: {voice.id}
                                            </span>
                                        </span>
                                        {isSelected && (
                                            <Check
                                                size={17}
                                                className="shrink-0 text-[var(--app-accent)]"
                                            />
                                        )}
                                    </button>
                                );
                            })}

                            {filteredVoices.length === 0 && (
                                <div className="px-3 py-8 text-center">
                                    <p className="text-sm text-[var(--app-text)]">
                                        Không tìm thấy giọng nói
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                        Thử tìm bằng tên ID khác.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
