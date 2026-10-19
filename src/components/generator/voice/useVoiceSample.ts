import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceSample {
    /** id giọng đang phát; null = im lặng. */
    playingId: string | null;
    /** id giọng vừa phát lỗi (mạng / trình duyệt chặn). */
    failedId: string | null;
    toggle: (id: string, url: string) => void;
    stop: () => void;
}

/** Một trình phát dùng chung: bấm giọng khác ⇒ dừng giọng cũ; rời trang ⇒ dừng. */
export function useVoiceSample(): VoiceSample {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [failedId, setFailedId] = useState<string | null>(null);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        audioRef.current = null;
        if (audio) {
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
        }
        setPlayingId(null);
    }, []);

    const toggle = useCallback((id: string, url: string) => {
        const wasPlaying = playingId === id;
        stop();
        if (wasPlaying) return;
        const audio = new Audio(url);
        audioRef.current = audio;
        const fail = () => {
            if (audioRef.current !== audio) return;
            audioRef.current = null;
            setPlayingId(null);
            setFailedId(id);
        };
        audio.onended = () => {
            if (audioRef.current === audio) stop();
        };
        audio.onerror = fail;
        setFailedId(null);
        setPlayingId(id);
        audio.play().catch(fail);
    }, [playingId, stop]);

    useEffect(() => stop, [stop]);

    return { playingId, failedId, toggle, stop };
}
