import type { SpeechGenerationResult } from "../types";

/**
 * Generate speech using ElevenLabs
 * TODO: Implement ElevenLabs TTS
 */
export async function generateSpeechElevenLabs(
	_text: string,
	_voiceId: string,
	_model: string,
): Promise<SpeechGenerationResult> {
	throw new Error("ElevenLabs TTS is not yet implemented");
}
