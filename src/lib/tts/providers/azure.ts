import type { SpeechGenerationResult } from "../types";

/**
 * Generate speech using Azure Cognitive Services
 * TODO: Implement Azure TTS
 */
export async function generateSpeechAzure(
	_text: string,
	_voiceId: string,
	_model: string,
): Promise<SpeechGenerationResult> {
	throw new Error("Azure TTS is not yet implemented");
}
