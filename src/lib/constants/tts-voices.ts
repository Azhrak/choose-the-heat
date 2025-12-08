import type { TTSProvider } from "~/lib/tts/config";

/**
 * Available TTS voices for each provider
 * Used across the application for voice selection
 */
export const TTS_VOICES: Record<
	TTSProvider,
	Array<{ id: string; name: string }>
> = {
	openai: [
		{ id: "alloy", name: "Alloy" },
		{ id: "echo", name: "Echo" },
		{ id: "fable", name: "Fable" },
		{ id: "onyx", name: "Onyx" },
		{ id: "nova", name: "Nova" },
		{ id: "shimmer", name: "Shimmer" },
	],
	google: [
		{ id: "Enceladus", name: "Enceladus (Male)" },
		{ id: "Puck", name: "Puck (Male)" },
		{ id: "Charon", name: "Charon (Male)" },
		{ id: "Kore", name: "Kore (Female)" },
		{ id: "Fenrir", name: "Fenrir (Male)" },
		{ id: "Aoede", name: "Aoede (Female)" },
	],
	elevenlabs: [
		{ id: "Rachel", name: "Rachel" },
		{ id: "Domi", name: "Domi" },
	],
	azure: [
		{ id: "en-US-JennyNeural", name: "Jenny (Female)" },
		{ id: "en-US-GuyNeural", name: "Guy (Male)" },
		{ id: "en-US-AriaNeural", name: "Aria (Female)" },
	],
} as const;
