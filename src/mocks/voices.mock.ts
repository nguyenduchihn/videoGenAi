import type { V1Voices, VoiceGender, VoicePreset } from "@/types/api";

// Bản sao catalogue backend (libs/google/src/voice-catalog.ts) cho chế độ mock.
const RAW: ReadonlyArray<readonly [string, string]> = [
    ["achernar", "Female, soft, high pitch"], ["achird", "Male, friendly, mid pitch"], ["algenib", "Male, gravelly, low pitch"],
    ["algieba", "Male, easy-going, mid-low pitch"], ["alnilam", "Male, firm, mid-low pitch"], ["aoede", "Female, breezy, mid pitch"],
    ["autonoe", "Female, bright, mid pitch"], ["callirrhoe", "Female, easy-going, mid pitch"], ["charon", "Male, informative, lower pitch"],
    ["despina", "Female, smooth, mid pitch"], ["enceladus", "Male, breathy, lower pitch"], ["erinome", "Female, clear, mid pitch"],
    ["fenrir", "Male, excitable, younger pitch"], ["gacrux", "Female, mature, mid pitch"], ["iapetus", "Male, clear, mid-low pitch"],
    ["kore", "Female, firm, mid pitch"], ["laomedeia", "Female, upbeat, mid-high pitch"], ["leda", "Female, youthful, mid-high pitch"],
    ["orus", "Male, firm, mid-low pitch"], ["puck", "Male, upbeat, mid pitch"], ["pulcherrima", "Ungendered, forward, mid-high pitch"],
    ["rasalgethi", "Male, informative, mid pitch"], ["sadachbia", "Male, lively, low pitch"], ["sadaltager", "Male, knowledgeable, mid pitch"],
    ["schedar", "Male, even, mid-low pitch"], ["sulafat", "Female, warm, mid pitch"], ["umbriel", "Male, smooth, lower pitch"],
    ["vindemiatrix", "Female, gentle, mid pitch"], ["zephyr", "Female, bright, mid-high pitch"], ["zubenelgenubi", "Male, casual, mid-low pitch"],
];

const GENDER: Record<string, VoiceGender> = { female: "female", male: "male", ungendered: "neutral" };

function toPreset([id, description]: readonly [string, string]): VoicePreset {
    const [gender = "", style = "", pitch = ""] = description.split(",").map((s) => s.trim().toLowerCase());
    const name = id.charAt(0).toUpperCase() + id.slice(1);
    return { id, name, gender: GENDER[gender] ?? "neutral", style, pitch: pitch.replace(/\s*pitch$/, ""), description, sampleUrl: `https://www.gstatic.com/aitestkitchen/voices/samples/${name}.wav` };
}

export const mockVoices: V1Voices = { voices: RAW.map(toPreset) };
export const MOCK_VOICE_IDS: ReadonlySet<string> = new Set(RAW.map(([id]) => id));
