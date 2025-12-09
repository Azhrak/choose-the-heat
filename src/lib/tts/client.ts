/**
 * Text-to-Speech Client - Text-to-Speech Feature
 *
 * Multi-provider TTS client supporting OpenAI, Google Cloud TTS, ElevenLabs, and Azure.
 * Handles both streaming and non-streaming audio generation with intelligent text chunking.
 *
 * @see docs/features/text-to-speech.md - Complete feature documentation
 * @update-trigger When adding/removing TTS providers or changing generation logic, update the feature doc
 */

import type { TTSConfig, TTSProvider } from "./config";
import {
	generateSpeechAzure,
	generateSpeechElevenLabs,
	generateSpeechGoogle,
	generateSpeechOpenAI,
} from "./providers";
import { generateSpeechGoogleStream } from "./providers/google";
import { generateSpeechOpenAIStream } from "./providers/openai";
import type { SpeechGenerationResult, SpeechStreamResult } from "./types";

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

/**
 * Main function to generate speech from text in streaming fashion
 * Dispatches to the appropriate provider implementation
 * Currently supports OpenAI and Google (Gemini) providers
 */
export async function generateSpeechStream(
	options: GenerateSpeechOptions,
): Promise<SpeechStreamResult> {
	const { text, provider, voiceId, config } = options;

	// Validate text length
	if (!text || text.trim().length === 0) {
		throw new Error("Text is required for speech generation");
	}

	console.log(
		`[TTS Stream] Generating streaming speech with ${provider}, voice: ${voiceId}, text length: ${text.length}`,
	);

	// Dispatch to provider-specific implementation
	switch (provider) {
		case "openai":
			return generateSpeechOpenAIStream(
				text,
				voiceId,
				config?.model || "tts-1",
			);
		case "google":
			return generateSpeechGoogleStream(
				text,
				voiceId,
				config?.model || "gemini-2.5-flash-tts",
			);
		case "elevenlabs":
		case "azure":
			throw new Error(
				`Streaming TTS is not yet supported for provider: ${provider}. Only OpenAI and Google are currently supported.`,
			);
		default:
			throw new Error(`Unsupported TTS provider: ${provider}`);
	}
}

// Re-export types for convenience
export type { SpeechGenerationResult, SpeechStreamResult } from "./types";
