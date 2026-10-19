import { Check, Film } from "lucide-react";
import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

export interface SessionVideo {
    mediaId: string;
    label: string;
    url?: string;
    createdAt?: string;
    source: "session" | "history";
}

interface SourceVideoPickerProps {
    value: string | null;
    label: string | null;
    videos: SessionVideo[];
    onSelect: (mediaId: string, label: string) => void;
    showManualInput?: boolean;
}

const formatDate = (iso?: string): string | null => {
    if (!iso) return null;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
};

function VideoCard({ video, selected, onSelect }: { video: SessionVideo; selected: boolean; onSelect: () => void }) {
    const date = formatDate(video.createdAt);
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={onSelect}
            className={`group relative overflow-hidden rounded-xl border text-left transition ${selected ? "border-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/30" : "border-[var(--app-border)] hover:border-[var(--app-accent)]/60"
                }`}
        >
            <div className="aspect-video bg-black">
                {video.url ? (
                    <video src={video.url} muted preload="metadata" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-[11px] text-[var(--app-text-muted)]">
                        <Film className="h-5 w-5" aria-hidden="true" />
                        Xem trước đã hết hạn
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-2 bg-[var(--app-surface)] px-3 py-2">
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--app-text)]">{video.label}</p>
                    <p className="truncate text-[11px] text-[var(--app-text-muted)]">{date ?? video.mediaId}</p>
                </div>
                {selected && <Check className="h-4 w-4 shrink-0 text-[var(--app-accent)]" aria-hidden="true" />}
            </div>
        </button>
    );
}

function VideoGroup({ title, videos, value, onSelect }: { title: string; videos: SessionVideo[]; value: string | null; onSelect: SourceVideoPickerProps["onSelect"] }) {
    if (videos.length === 0) return null;
    const selectedIndex = videos.findIndex((video) => video.mediaId === value);
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        if (step === 0) return;
        event.preventDefault();
        const next = videos[(Math.max(selectedIndex, 0) + step + videos.length) % videos.length];
        if (next) onSelect(next.mediaId, next.label);
    };
    return (
        <div>
            <p className="mb-2 text-xs font-semibold text-[var(--app-text-secondary)]">{title}</p>
            <div role="radiogroup" aria-label={title} onKeyDown={handleKeyDown} className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3">
                {videos.map((video) => (
                    <VideoCard
                        key={`${video.source}-${video.mediaId}`}
                        video={video}
                        selected={video.mediaId === value}
                        onSelect={() => onSelect(video.mediaId, video.label)}
                    />
                ))}
            </div>
        </div>
    );
}

export default function SourceVideoPicker({ value, label, videos, onSelect, showManualInput = false, }: SourceVideoPickerProps) {
    const [manual, setManual] = useState("");
    const session = videos.filter((video) => video.source === "session");
    const history = videos.filter((video) => video.source === "history");
    const manualId = manual.trim();
    const inputId = useId();

    const applyManual = () => {
        if (!manualId) return;
        onSelect(manualId, `mediaId ${manualId.slice(0, 12)}…`);
        setManual("");
    };

    return (
        <div className="space-y-4">
            {videos.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-5 text-center text-xs text-[var(--app-text-muted)]">
                    {showManualInput
                        ? "Chưa có video hoàn thành nào trong phiên này. Tạo video trước hoặc nhập mediaId."
                        : "Chưa có video hoàn thành nào trong phiên này."}
                </p>
            )}
            <VideoGroup title="Từ kết quả phiên này" videos={session} value={value} onSelect={onSelect} />
            <VideoGroup title="Video gần đây" videos={history} value={value} onSelect={onSelect} />

            {showManualInput && (
                <div>
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-xs font-semibold text-[var(--app-text-secondary)]"
                    >
                        Nhập mediaId
                    </label>

                    <div className="flex gap-2">
                        <input
                            id={inputId}
                            value={manual}
                            onChange={(event) => setManual(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    applyManual();
                                }
                            }}
                            placeholder="mediaId của video đã tạo"
                            autoComplete="off"
                            spellCheck={false}
                            className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-accent)]"
                        />

                        <button
                            type="button"
                            onClick={applyManual}
                            disabled={!manualId}
                            className="h-10 shrink-0 rounded-xl border border-[var(--app-border)] px-4 text-xs font-medium text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Dùng
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-1 text-xs">
                <p className="text-[var(--app-text)]" aria-live="polite">
                    {value ? <>Đã chọn: <span className="font-medium">{label ?? value}</span></> : null}
                </p>
                {showManualInput && (
                    <p className="text-xs text-[var(--app-text-muted)]">
                        Video sẽ được nối dài trên đúng tài khoản đã tạo nó.
                    </p>
                )}
            </div>
        </div>
    );
}
