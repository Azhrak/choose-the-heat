/**
 * Result of speech generation
 */
export interface SpeechGenerationResult {
	audioBuffer: Buffer;
	duration: number; // in seconds (estimated)
	format: string;
}

/**
 * A chunk of streaming audio data
 */
export interface SpeechStreamChunk {
	chunk: Buffer;
	index: number;
	isLast: boolean;
}

/**
 * Metadata about the streaming audio
 */
export interface SpeechStreamMetadata {
	estimatedDuration: number;
	format: string;
	totalChunks?: number;
}

/**
 * Result of streaming speech generation
 */
export interface SpeechStreamResult {
	metadata: SpeechStreamMetadata;
	stream: AsyncIterable<SpeechStreamChunk>;
}

/**
 * Provider-specific speech generation function
 */
export type ProviderGenerateSpeech = (
	text: string,
	voiceId: string,
	model: string,
) => Promise<SpeechGenerationResult>;

/**
 * Provider-specific streaming speech generation function
 */
export type ProviderGenerateSpeechStream = (
	text: string,
	voiceId: string,
	model: string,
) => Promise<SpeechStreamResult>;
