import OpenAI from "openai";
import type { TTSConfig, TTSProvider } from "./config";

/**
 * Result of speech generation
 */
export interface SpeechGenerationResult {
	audioBuffer: Buffer;
	duration: number; // in seconds (estimated)
	format: string;
}

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
 * Split text into chunks at sentence boundaries, respecting max length
 */
function chunkText(text: string, maxLength: number): string[] {
	if (text.length <= maxLength) {
		return [text];
	}

	const chunks: string[] = [];
	// Split on sentence boundaries (. ! ? followed by space or end of string)
	const sentences = text.match(/[^.!?]+[.!?]+[\s]?|[^.!?]+$/g) || [text];

	let currentChunk = "";

	for (const sentence of sentences) {
		// If adding this sentence would exceed the limit
		if (currentChunk.length + sentence.length > maxLength) {
			// If we have a current chunk, save it
			if (currentChunk) {
				chunks.push(currentChunk.trim());
				currentChunk = "";
			}

			// If the sentence itself is too long, split it at word boundaries
			if (sentence.length > maxLength) {
				const words = sentence.split(/\s+/);
				for (const word of words) {
					if (currentChunk.length + word.length + 1 > maxLength) {
						if (currentChunk) {
							chunks.push(currentChunk.trim());
							currentChunk = "";
						}
					}
					currentChunk += (currentChunk ? " " : "") + word;
				}
			} else {
				currentChunk = sentence;
			}
		} else {
			currentChunk += sentence;
		}
	}

	// Add any remaining chunk
	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

/**
 * Generate speech using OpenAI TTS
 * Automatically chunks text longer than 4096 characters
 */
async function generateSpeechOpenAI(
	text: string,
	voiceId: string,
	model: string = "tts-1",
): Promise<SpeechGenerationResult> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is not set");
	}

	const openai = new OpenAI({ apiKey });
	const MAX_LENGTH = 4096;

	// Split text into chunks if necessary
	const chunks = chunkText(text, MAX_LENGTH);

	console.log(
		`[TTS OpenAI] Processing ${chunks.length} chunk(s) for ${text.length} characters`,
	);

	// Generate audio for each chunk
	const audioBuffers: Buffer[] = [];
	let totalDuration = 0;

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		console.log(
			`[TTS OpenAI] Generating chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`,
		);

		const response = await openai.audio.speech.create({
			model: model as "tts-1" | "tts-1-hd",
			voice: voiceId as
				| "alloy"
				| "echo"
				| "fable"
				| "onyx"
				| "nova"
				| "shimmer",
			input: chunk,
			response_format: "mp3",
			speed: 1.0,
		});

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		audioBuffers.push(buffer);

		// Estimate duration for this chunk
		const wordCount = chunk.split(/\s+/).length;
		const chunkDuration = Math.ceil((wordCount / 150) * 60);
		totalDuration += chunkDuration;
	}

	// Concatenate all audio buffers
	// MP3 files can be concatenated directly as they are stream-based
	const combinedBuffer = Buffer.concat(audioBuffers);

	console.log(
		`[TTS OpenAI] Combined ${chunks.length} chunks into ${combinedBuffer.length} bytes, estimated duration: ${totalDuration}s`,
	);

	return {
		audioBuffer: combinedBuffer,
		duration: totalDuration,
		format: "mp3",
	};
}

/**
 * Generate speech using Google Cloud TTS
 * TODO: Implement Google Cloud TTS
 */
async function generateSpeechGoogle(
	_text: string,
	_voiceId: string,
	_model: string,
): Promise<SpeechGenerationResult> {
	throw new Error("Google Cloud TTS is not yet implemented");
}

/**
 * Generate speech using ElevenLabs
 * TODO: Implement ElevenLabs TTS
 */
async function generateSpeechElevenLabs(
	_text: string,
	_voiceId: string,
	_model: string,
): Promise<SpeechGenerationResult> {
	throw new Error("ElevenLabs TTS is not yet implemented");
}

/**
 * Generate speech using Azure Cognitive Services
 * TODO: Implement Azure TTS
 */
async function generateSpeechAzure(
	_text: string,
	_voiceId: string,
	_model: string,
): Promise<SpeechGenerationResult> {
	throw new Error("Azure TTS is not yet implemented");
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

	// Note: OpenAI has a 4096 character limit, but we handle chunking automatically

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
				voiceId,
				config?.model || "gemini-2.5-pro-tts",
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
