import OpenAI from "openai";
import type { SpeechGenerationResult } from "../types";
import { chunkText, estimateDuration } from "../utils";

const MAX_LENGTH = 4096;

/**
 * Generate speech using OpenAI TTS
 * Automatically chunks text longer than 4096 characters
 */
export async function generateSpeechOpenAI(
	text: string,
	voiceId: string,
	model: string = "tts-1",
): Promise<SpeechGenerationResult> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is not set");
	}

	const openai = new OpenAI({ apiKey });

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
		totalDuration += estimateDuration(chunk);
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
