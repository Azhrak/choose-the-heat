/**
 * Result of speech generation
 */
export interface SpeechGenerationResult {
	audioBuffer: Buffer;
	duration: number; // in seconds (estimated)
	format: string;
}

/**
 * Provider-specific speech generation function
 */
export type ProviderGenerateSpeech = (
	text: string,
	voiceId: string,
	model: string,
) => Promise<SpeechGenerationResult>;
