import type { VoiceGender, VoicePreset } from "@/types/api";

export const GENDER_LABEL: Record<VoiceGender, string> = { female: "Nữ", male: "Nam", neutral: "Trung tính" };

const STYLE_LABEL: Record<string, string> = {
    soft: "nhẹ nhàng",
    friendly: "thân thiện",
    gravelly: "khàn",
    "easy-going": "thoải mái",
    firm: "chắc giọng",
    breezy: "thoáng",
    bright: "sáng",
    informative: "truyền đạt",
    smooth: "mượt",
    breathy: "nhiều hơi",
    clear: "trong",
    excitable: "hào hứng",
    mature: "trưởng thành",
    upbeat: "vui tươi",
    youthful: "trẻ trung",
    forward: "dứt khoát",
    lively: "sôi nổi",
    knowledgeable: "am hiểu",
    even: "đều giọng",
    warm: "ấm",
    gentle: "dịu dàng",
    casual: "tự nhiên",
};

const PITCH_LABEL: Record<string, string> = {
    high: "cao",
    "mid-high": "hơi cao",
    mid: "trung",
    "mid-low": "hơi trầm",
    low: "trầm",
    lower: "trầm",
    younger: "trẻ",
};

/** "Nữ · nhẹ nhàng · giọng cao" — từ khoá Google chưa có bản dịch giữ nguyên tiếng Anh. */
export function voiceSummary(voice: Pick<VoicePreset, "gender" | "style" | "pitch">): string {
    const style = STYLE_LABEL[voice.style] ?? voice.style;
    const pitch = PITCH_LABEL[voice.pitch] ?? voice.pitch;
    return [GENDER_LABEL[voice.gender] ?? voice.gender, style, pitch && `giọng ${pitch}`].filter(Boolean).join(" · ");
}

/** Tên hiển thị của id giọng: "Achernar" (catalog chưa tải ⇒ viết hoa chữ đầu). */
export function voiceName(id: string, voices?: readonly VoicePreset[]): string {
    return voices?.find((v) => v.id === id)?.name ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export function matchesVoiceQuery(voice: VoicePreset, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [voice.name, voice.description, voiceSummary(voice)].some((text) => text.toLowerCase().includes(q));
}
