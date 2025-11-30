import type { TTSConfig, TTSProvider } from "./config";
import {
	generateSpeechAzure,
	generateSpeechElevenLabs,
	generateSpeechGoogle,
	generateSpeechOpenAI,
} from "./providers";
import type { SpeechGenerationResult } from "./types";

/**
 * Options for generating speech
 */
export interface GenerateSpeechOptions {
	text: string;
	provider: TTSProvider;
	voiceId: string;
	config?: TTSConfig;
}

/**
 * Main function to generate speech from text
 * Dispatches to the appropriate provider implementation
 */
export async function generateSpeech(
	options: GenerateSpeechOptions,
): Promise<SpeechGenerationResult> {
	const { text, provider, voiceId, config } = options;

	// Validate text length
	if (!text || text.trim().length === 0) {
		throw new Error("Text is required for speech generation");
	}

	console.log(
		`[TTS] Generating speech with ${provider}, voice: ${voiceId}, text length: ${text.length}`,
	);

	// Dispatch to provider-specific implementation
	switch (provider) {
		case "openai":
			return generateSpeechOpenAI(text, voiceId, config?.model || "tts-1");
		case "google":
			return generateSpeechGoogle(
				text,
				voiceId || "Enceladus",
				config?.model || "gemini-2.5-flash-tts",
			);
		case "elevenlabs":
			return generateSpeechElevenLabs(
				text,
				voiceId,
				config?.model || "eleven_multilingual_v2",
			);
		case "azure":
			return generateSpeechAzure(
				text,
				voiceId,
				config?.model || "en-US-JennyNeural",
			);
		default:
			throw new Error(`Unsupported TTS provider: ${provider}`);
	}
}

// Re-export types for convenience
export type { SpeechGenerationResult } from "./types";
