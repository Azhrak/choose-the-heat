import type { TTSProvider } from "../tts/config";
import type { AIProvider } from "./client";

/**
 * Provider Registry - Single Source of Truth
 *
 * Centralized definition of all AI and TTS providers with their metadata.
 * This eliminates hard-coded provider constants scattered throughout the codebase.
 */

export interface ProviderMetadata {
	id: string;
	name: string;
	description: string;
	category: "text" | "tts";
	defaultModel: string;
	supportedModels: string[];
	requiresAPIKey: boolean;
	testModel: string;
	envKeyName: string;
}

/**
 * AI Text Generation Providers
 */
export const AI_TEXT_PROVIDERS: Record<AIProvider, ProviderMetadata> = {
	openai: {
		id: "openai",
		name: "OpenAI",
		description: "GPT models for high-quality creative text generation",
		category: "text",
		defaultModel: "gpt-4o-mini",
		supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
		requiresAPIKey: true,
		testModel: "gpt-4o-mini",
		envKeyName: "OPENAI_API_KEY",
	},
	google: {
		id: "google",
		name: "Google Gemini",
		description: "Gemini models for cost-effective, fast text generation",
		category: "text",
		defaultModel: "gemini-2.5-flash-lite",
		supportedModels: [
			"gemini-2.5-flash-lite",
			"gemini-1.5-pro",
			"gemini-1.5-flash",
		],
		requiresAPIKey: true,
		testModel: "gemini-2.5-flash-lite",
		envKeyName: "GOOGLE_GENERATIVE_AI_API_KEY",
	},
	anthropic: {
		id: "anthropic",
		name: "Anthropic Claude",
		description: "Claude models for creative, nuanced writing",
		category: "text",
		defaultModel: "claude-3-5-sonnet-20241022",
		supportedModels: [
			"claude-3-5-sonnet-20241022",
			"claude-3-opus-20240229",
			"claude-3-haiku-20240307",
		],
		requiresAPIKey: true,
		testModel: "claude-haiku-4-5",
		envKeyName: "ANTHROPIC_API_KEY",
	},
	mistral: {
		id: "mistral",
		name: "Mistral AI",
		description: "Mistral models for European AI, multilingual support",
		category: "text",
		defaultModel: "mistral-medium-2508",
		supportedModels: [
			"mistral-medium-2508",
			"mistral-small-latest",
			"mistral-large-latest",
		],
		requiresAPIKey: true,
		testModel: "mistral-small-latest",
		envKeyName: "MISTRAL_API_KEY",
	},
	xai: {
		id: "xai",
		name: "xAI Grok",
		description: "Grok models for fast reasoning and real-time data",
		category: "text",
		defaultModel: "grok-4-fast-reasoning",
		supportedModels: ["grok-4-fast-reasoning", "grok-2", "grok-beta"],
		requiresAPIKey: true,
		testModel: "grok-4-fast-non-reasoning",
		envKeyName: "XAI_API_KEY",
	},
	openrouter: {
		id: "openrouter",
		name: "OpenRouter",
		description: "Multi-provider router for accessing various AI models",
		category: "text",
		defaultModel: "openai/gpt-4o-mini",
		supportedModels: [
			"openai/gpt-4o-mini",
			"anthropic/claude-3.5-sonnet",
			"nousresearch/hermes-3-llama-3.1-70b",
		],
		requiresAPIKey: true,
		testModel: "arcee-ai/trinity-mini:free",
		envKeyName: "OPENROUTER_API_KEY",
	},
};

/**
 * Text-to-Speech Providers
 */
export const TTS_PROVIDERS: Record<TTSProvider, ProviderMetadata> = {
	openai: {
		id: "openai",
		name: "OpenAI TTS",
		description: "Text-to-Speech using OpenAI voices",
		category: "tts",
		defaultModel: "tts-1",
		supportedModels: ["tts-1", "tts-1-hd"],
		requiresAPIKey: true,
		testModel: "tts-1",
		envKeyName: "OPENAI_API_KEY",
	},
	google: {
		id: "google",
		name: "Google TTS",
		description: "Text-to-Speech using Google Cloud voices",
		category: "tts",
		defaultModel: "gemini-2.5-flash-tts",
		supportedModels: [
			"gemini-2.5-flash-tts",
			"gemini-2.5-flash-lite-preview-tts",
		],
		requiresAPIKey: true,
		testModel: "gemini-2.5-flash-lite-preview-tts",
		envKeyName: "GOOGLE_GENERATIVE_AI_API_KEY",
	},
	elevenlabs: {
		id: "elevenlabs",
		name: "ElevenLabs",
		description: "Premium voice synthesis with natural-sounding voices",
		category: "tts",
		defaultModel: "Rachel",
		supportedModels: ["Rachel", "Domi"],
		requiresAPIKey: true,
		testModel: "Rachel",
		envKeyName: "ELEVENLABS_API_KEY",
	},
	azure: {
		id: "azure",
		name: "Azure TTS",
		description: "Microsoft Azure Text-to-Speech service",
		category: "tts",
		defaultModel: "en-US-JennyNeural",
		supportedModels: [
			"en-US-JennyNeural",
			"en-US-GuyNeural",
			"en-US-AriaNeural",
		],
		requiresAPIKey: true,
		testModel: "en-US-JennyNeural",
		envKeyName: "AZURE_SPEECH_KEY",
	},
};

/**
 * Helper Functions
 */

/**
 * Get metadata for a specific AI text provider
 */
export function getProviderMetadata(
	provider: AIProvider,
): ProviderMetadata | undefined {
	return AI_TEXT_PROVIDERS[provider];
}

/**
 * Get metadata for a specific TTS provider
 */
export function getTTSProviderMetadata(
	provider: TTSProvider,
): ProviderMetadata | undefined {
	return TTS_PROVIDERS[provider];
}

/**
 * Get all AI text providers as an array
 */
export function getAllTextProviders(): ProviderMetadata[] {
	return Object.values(AI_TEXT_PROVIDERS);
}

/**
 * Get all TTS providers as an array
 */
export function getAllTTSProviders(): ProviderMetadata[] {
	return Object.values(TTS_PROVIDERS);
}

/**
 * Get provider metadata by ID and category
 */
export function getProviderMetadataById(
	providerId: string,
	category: "text" | "tts",
): ProviderMetadata | undefined {
	if (category === "text") {
		return AI_TEXT_PROVIDERS[providerId as AIProvider];
	}
	return TTS_PROVIDERS[providerId as TTSProvider];
}

/**
 * Check if a provider ID is valid for the given category
 */
export function isValidProvider(
	providerId: string,
	category: "text" | "tts",
): boolean {
	if (category === "text") {
		return providerId in AI_TEXT_PROVIDERS;
	}
	return providerId in TTS_PROVIDERS;
}
