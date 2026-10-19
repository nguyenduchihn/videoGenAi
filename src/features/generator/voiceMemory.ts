/** Nhớ giọng đã chọn theo từng khách (localStorage) ⇒ lần sau mở chế độ ảnh tham chiếu vẫn giữ cùng giọng. */
const keyOf = (userId: string) => `videogen:voice:${userId}`;
const VOICE_ID_RE = /^[a-z]{2,40}$/;

export function readRememberedVoice(userId: string | undefined): string {
    if (!userId) return "";
    try {
        const value = window.localStorage.getItem(keyOf(userId)) ?? "";
        return VOICE_ID_RE.test(value) ? value : "";
    } catch {
        return "";
    }
}

export function rememberVoice(userId: string | undefined, voice: string): void {
    if (!userId) return;
    try {
        if (voice) window.localStorage.setItem(keyOf(userId), voice);
        else window.localStorage.removeItem(keyOf(userId));
    } catch {
        // Trình duyệt chặn lưu trữ ⇒ chỉ mất phần ghi nhớ, không ảnh hưởng tạo video.
    }
}
