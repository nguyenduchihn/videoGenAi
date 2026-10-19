import { describe, expect, it } from "vitest";
import { mockVoices } from "@/mocks/voices.mock";
import { matchesVoiceQuery, voiceName, voiceSummary } from "./voiceLabels";

const voice = (id: string) => mockVoices.voices.find((v) => v.id === id)!;

describe("voiceLabels", () => {
    it("tóm tắt tiếng Việt từ giới tính / chất giọng / cao độ; từ khoá lạ giữ nguyên", () => {
        expect(voiceSummary(voice("achernar"))).toBe("Nữ · nhẹ nhàng · giọng cao");
        expect(voiceSummary(voice("pulcherrima"))).toBe("Trung tính · dứt khoát · giọng hơi cao");
        expect(voiceSummary({ gender: "male", style: "raspy", pitch: "ultra" })).toBe("Nam · raspy · giọng ultra");
    });

    it("mọi giọng trong catalogue đều có bản dịch", () => {
        for (const v of mockVoices.voices) expect(voiceSummary(v).split(" · ")).not.toContain(v.style);
    });

    it("tên hiển thị từ catalogue, chưa tải ⇒ viết hoa chữ đầu", () => {
        expect(voiceName("kore", mockVoices.voices)).toBe("Kore");
        expect(voiceName("zephyr")).toBe("Zephyr");
    });

    it("tìm theo tên, mô tả gốc tiếng Anh hoặc nhãn tiếng Việt", () => {
        expect(matchesVoiceQuery(voice("sulafat"), "ấm")).toBe(true);
        expect(matchesVoiceQuery(voice("sulafat"), "warm")).toBe(true);
        expect(matchesVoiceQuery(voice("sulafat"), "KORE")).toBe(false);
        expect(matchesVoiceQuery(voice("kore"), "  ")).toBe(true);
    });
});
