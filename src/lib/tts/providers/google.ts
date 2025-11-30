import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import type { google } from "@google-cloud/text-to-speech/build/protos/protos";
import type { SpeechGenerationResult } from "../types";
import { chunkTextByBytes, estimateDuration } from "../utils";

// Google Cloud TTS byte limits vary by model:
// - gemini-2.5-flash-lite-preview-tts: 512 bytes after text normalization
// - Default: 4000 bytes
const MAX_BYTES_GEMINI_LITE = 450; // 512 byte limit with safety margin
const MAX_BYTES_DEFAULT = 3950; // 4000 byte limit with safety margin

const FEMALE_VOICES = [
	"Achernar",
	"Aoede",
	"Autonoe",
	"Callirrhoe",
	"Despina",
	"Erinome",
	"Gacrux",
	"Kore",
	"Laomedeia",
	"Leda",
	"Pulcherrima",
	"Sulafat",
	"Vindemiatrix",
	"Zephyr",
];

/**
 * Generate speech using Google Cloud TTS
 * Supports new voice names (Puck, Kore, etc.) with MP3 output
 */
export async function generateSpeechGoogle(
	text: string,
	voiceId: string,
	model: string,
): Promise<SpeechGenerationResult> {
	// Google Cloud TTS requires service account credentials, not API key
	// Use GOOGLE_TTS_ACCOUNT_JSON if available, otherwise fall back to GCS_SERVICE_ACCOUNT_JSON
	const serviceAccountJson =
		process.env.GOOGLE_TTS_ACCOUNT_JSON || process.env.GCS_SERVICE_ACCOUNT_JSON;
	if (!serviceAccountJson) {
		throw new Error(
			"GOOGLE_TTS_ACCOUNT_JSON or GCS_SERVICE_ACCOUNT_JSON environment variable is not set",
		);
	}

	let credentials: Record<string, unknown>;
	try {
		credentials =
			typeof serviceAccountJson === "string"
				? JSON.parse(serviceAccountJson)
				: serviceAccountJson;
	} catch (error) {
		throw new Error(
			`Failed to parse service account JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	// Initialize the client with service account credentials
	const client = new TextToSpeechClient({
		credentials,
	});

	// TODO: Allow user preference for language code
	const languageCode = "en-US";

	// Determine gender from voice name
	const ssmlGender = FEMALE_VOICES.includes(voiceId) ? 1 : 2; // 1 = FEMALE, 2 = MALE

	console.log(
		`[TTS Google] Generating speech with model ${model}, voice ${voiceId}, language ${languageCode}, gender ${ssmlGender === 2 ? "MALE" : "FEMALE"}`,
	);

	// Choose byte limit based on model
	const maxBytes =
		model === "gemini-2.5-flash-lite-preview-tts"
			? MAX_BYTES_GEMINI_LITE
			: MAX_BYTES_DEFAULT;

	const chunks = chunkTextByBytes(text, maxBytes);

	console.log(
		`[TTS Google] Using ${maxBytes} byte limit for model ${model}. Processing ${chunks.length} chunk(s) for ${text.length} characters (${Buffer.byteLength(text, "utf8")} bytes)`,
	);

	const audioBuffers: Buffer[] = [];
	let totalDuration = 0;

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const chunkBytes = Buffer.byteLength(chunk, "utf8");
		console.log(
			`[TTS Google] Generating chunk ${i + 1}/${chunks.length} (${chunk.length} chars, ${chunkBytes} bytes)`,
		);

		const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
			input: { text: chunk },
			voice: {
				languageCode,
				name: voiceId,
				ssmlGender,
				modelName: model,
			},
			audioConfig: {
				audioEncoding: "MP3",
				speakingRate: 1.0,
				pitch: 0.0,
			},
		};

		const [response] = await client.synthesizeSpeech(request);

		if (!response.audioContent) {
			throw new Error("Google TTS returned no audio content");
		}

		const buffer = Buffer.from(
			response.audioContent as Uint8Array | string | number[],
		);
		audioBuffers.push(buffer);

		// Estimate duration for this chunk
		totalDuration += estimateDuration(chunk);
	}

	// Concatenate all audio buffers (MP3 files can be concatenated directly)
	const combinedBuffer = Buffer.concat(audioBuffers);

	console.log(
		`[TTS Google] Combined ${chunks.length} chunks into ${combinedBuffer.length} bytes, estimated duration: ${totalDuration}s`,
	);

	return {
		audioBuffer: combinedBuffer,
		duration: totalDuration,
		format: "mp3",
	};
}
