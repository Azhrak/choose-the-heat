import { getSettingsMap } from "../db/queries/settings";
import type { AIProvider } from "./client";

/**
 * AI Configuration from settings
 */
export interface AIConfig {
	provider: AIProvider;
	model: string;
	temperature: number;
	maxTokens: number;
	fallbackEnabled: boolean;
	fallbackProvider?: AIProvider;
	timeoutSeconds: number;
	availableModels: Record<AIProvider, string[]>;
}

/**
 * In-memory cache for settings
 */
interface SettingsCache {
	data: AIConfig | null;
	timestamp: number;
}

const cache: SettingsCache = {
	data: null,
	timestamp: 0,
};

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Invalidate the settings cache
 * Call this after updating settings via the API
 */
export function invalidateSettingsCache(): void {
	cache.data = null;
	cache.timestamp = 0;
}

/**
 * Get AI configuration from environment variables
 * Used as fallback when database settings are not available
 */
function getConfigFromEnv(): AIConfig {
	const provider = (
		process.env.AI_PROVIDER || "openai"
	).toLowerCase() as AIProvider;

	const defaultModels: Record<AIProvider, string> = {
		openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
		google: process.env.GOOGLE_MODEL || "gemini-2.5-flash-lite",
		anthropic: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
		mistral: process.env.MISTRAL_MODEL || "mistral-medium-2508",
		xai: process.env.XAI_MODEL || "grok-4-fast-reasoning",
		openrouter: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
	};

	return {
		provider,
		model: defaultModels[provider],
		temperature: 0.7,
		maxTokens: 2000,
		fallbackEnabled: false,
		timeoutSeconds: 60,
		availableModels: {
			openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
			google: ["gemini-2.5-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"],
			anthropic: [
				"claude-3-5-sonnet-20241022",
				"claude-3-opus-20240229",
				"claude-3-haiku-20240307",
			],
			mistral: [
				"mistral-medium-2508",
				"mistral-small-latest",
				"mistral-large-latest",
			],
			xai: ["grok-4-fast-reasoning", "grok-2", "grok-beta"],
			openrouter: [
				"openai/gpt-4o-mini",
				"anthropic/claude-3.5-sonnet",
				"nousresearch/hermes-3-llama-3.1-70b",
			],
		},
	};
}

/**
 * Parse settings from database into AIConfig
 */
function parseSettings(settings: Record<string, string>): AIConfig {
	const envFallback = getConfigFromEnv();

	// Parse available models JSON
	let availableModels = envFallback.availableModels;
	try {
		if (settings["ai.available_models"]) {
			availableModels = JSON.parse(settings["ai.available_models"]);
		}
	} catch (error) {
		console.error("Failed to parse ai.available_models:", error);
	}

	return {
		provider: (settings["ai.provider"] || envFallback.provider) as AIProvider,
		model: settings["ai.model"] || envFallback.model,
		temperature: settings["ai.temperature"]
			? Number.parseFloat(settings["ai.temperature"])
			: envFallback.temperature,
		maxTokens: settings["ai.max_tokens"]
			? Number.parseInt(settings["ai.max_tokens"], 10)
			: envFallback.maxTokens,
		fallbackEnabled:
			settings["ai.fallback_enabled"] === "true" || envFallback.fallbackEnabled,
		fallbackProvider: settings["ai.fallback_provider"]
			? (settings["ai.fallback_provider"] as AIProvider)
			: envFallback.fallbackProvider,
		timeoutSeconds: settings["ai.timeout_seconds"]
			? Number.parseInt(settings["ai.timeout_seconds"], 10)
			: envFallback.timeoutSeconds,
		availableModels,
	};
}

/**
 * Get AI configuration
 * Uses the following priority:
 * 1. In-memory cache (if fresh)
 * 2. Database settings
 * 3. Environment variables
 */
export async function getAIConfig(): Promise<AIConfig> {
	// Check cache
	const now = Date.now();
	if (cache.data && now - cache.timestamp < CACHE_TTL) {
		return cache.data;
	}

	try {
		// Try to load from database
		const settings = await getSettingsMap({ category: "ai" });

		if (Object.keys(settings).length > 0) {
			const config = parseSettings(settings);

			// Update cache
			cache.data = config;
			cache.timestamp = now;

			return config;
		}
	} catch (error) {
		console.error("Failed to load AI settings from database:", error);
	}

	// Fall back to environment variables
	const envConfig = getConfigFromEnv();

	// Cache env config as well
	cache.data = envConfig;
	cache.timestamp = now;

	return envConfig;
}

/**
 * Get the default model for the configured provider
 */
export async function getDefaultModel(): Promise<string> {
	const config = await getAIConfig();
	return config.model;
}

/**
 * Get the current AI provider
 */
export async function getCurrentProvider(): Promise<AIProvider> {
	const config = await getAIConfig();
	return config.provider;
}

/**
 * Get available models for a specific provider
 */
export async function getAvailableModels(
	provider: AIProvider,
): Promise<string[]> {
	const config = await getAIConfig();
	return config.availableModels[provider] || [];
}

/**
 * Get all available models mapped by provider
 */
export async function getAllAvailableModels(): Promise<
	Record<AIProvider, string[]>
> {
	const config = await getAIConfig();
	return config.availableModels;
}
