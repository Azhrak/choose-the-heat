import {
	getDefaultModelForProvider,
	getModelByProviderId,
} from "../db/queries/aiModels";
import { getSettingsMap } from "../db/queries/settings";
import type { AIProvider } from "./client";
import { getAllTextProviders } from "./providers";

/**
 * AI Configuration from settings
 */
export interface AIConfig {
	provider: AIProvider;
	model: string;
	temperature: number;
	maxOutputTokens: number;
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
 * Now uses provider registry as single source of truth
 */
function getConfigFromEnv(): AIConfig {
	const providers = getAllTextProviders();
	const provider = (
		process.env.AI_PROVIDER || "openai"
	).toLowerCase() as AIProvider;

	// Build default models map from provider registry
	const defaultModels: Record<AIProvider, string> = {} as Record<
		AIProvider,
		string
	>;
	for (const p of providers) {
		const envVarName = `${p.id.toUpperCase()}_MODEL`;
		defaultModels[p.id as AIProvider] =
			process.env[envVarName] || p.defaultModel;
	}

	// Build available models from provider registry
	const availableModels: Record<AIProvider, string[]> = {} as Record<
		AIProvider,
		string[]
	>;
	for (const p of providers) {
		availableModels[p.id as AIProvider] = p.supportedModels;
	}

	return {
		provider,
		model: defaultModels[provider],
		temperature: 0.7,
		maxOutputTokens: 2000,
		fallbackEnabled: false,
		timeoutSeconds: 60,
		availableModels,
	};
}

/**
 * Parse settings from database into AIConfig
 */
async function parseSettings(
	settings: Record<string, string>,
): Promise<AIConfig> {
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

	const provider = (settings["ai.provider"] ||
		envFallback.provider) as AIProvider;

	// Get the default model for this provider from the database
	let model = envFallback.model;
	const defaultModel = await getDefaultModelForProvider(provider, "text");
	if (defaultModel && defaultModel.status === "enabled") {
		model = defaultModel.model_id;
	}

	return {
		provider,
		model,
		temperature: settings["ai.temperature"]
			? Number.parseFloat(settings["ai.temperature"])
			: envFallback.temperature,
		maxOutputTokens: settings["ai.max_tokens"]
			? Number.parseInt(settings["ai.max_tokens"], 10)
			: envFallback.maxOutputTokens,
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

	let config: AIConfig;

	try {
		// Try to load from database
		const settings = await getSettingsMap({ category: "ai" });

		if (Object.keys(settings).length > 0) {
			config = await parseSettings(settings);

			// Update cache
			cache.data = config;
			cache.timestamp = now;

			return config;
		}
	} catch (error) {
		console.error("Failed to load AI settings from database:", error);
	}

	// Fall back to environment variables
	config = getConfigFromEnv();

	// Cache env config as well
	cache.data = config;
	cache.timestamp = now;

	return config;
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

/**
 * Get default model name for a specific provider (string only)
 * Checks setting ai.<provider>.default_model first, falls back to available_models
 * @deprecated Use getDefaultModelForProvider from aiModels.ts instead
 */
export async function getDefaultModelName(
	provider: AIProvider,
): Promise<string> {
	const settings = await getSettingsMap({ category: "ai" });

	// Check for provider-specific default
	const providerDefault = settings[`ai.${provider}.default_model`];
	if (providerDefault) {
		return providerDefault;
	}

	// Fall back to first available model
	const config = await getAIConfig();
	const models = config.availableModels[provider];
	if (models && models.length > 0) {
		return models[0];
	}

	// Last resort: use provider registry default
	const providers = getAllTextProviders();
	const providerMeta = providers.find((p) => p.id === provider);
	return providerMeta?.defaultModel || "gpt-4o-mini";
}

/**
 * Get AI configuration for a specific story, with fallback to current settings
 * If the story has saved AI settings, use those (if still valid)
 * Otherwise, use the current app settings
 * Now uses database validation for model status
 */
export async function getAIConfigForStory(
	storyProvider?: string | null,
	storyModel?: string | null,
	storyTemperature?: string | number | null,
): Promise<AIConfig> {
	const currentConfig = await getAIConfig();

	// If no story-specific settings, use current config
	if (!storyProvider || !storyModel) {
		return currentConfig;
	}

	// Validate that the provider still exists
	const provider = storyProvider as AIProvider;
	if (!currentConfig.availableModels[provider]) {
		console.log(
			`[AI Config] Story provider "${provider}" no longer available, falling back to current provider "${currentConfig.provider}"`,
		);
		return currentConfig;
	}

	// Check if story's model is still enabled in database
	const modelRecord = await getModelByProviderId(provider, "text", storyModel);

	if (
		!modelRecord ||
		modelRecord.status === "deprecated" ||
		modelRecord.status === "disabled"
	) {
		console.log(
			`[AI Config] Story model "${storyModel}" is ${modelRecord?.status || "not found"}, falling back to provider default`,
		);

		// Fall back to provider's default model
		const defaultModel = await getDefaultModelForProvider(provider, "text");

		if (defaultModel && defaultModel.status === "enabled") {
			// Parse temperature
			const temperature =
				typeof storyTemperature === "string"
					? Number.parseFloat(storyTemperature)
					: typeof storyTemperature === "number"
						? storyTemperature
						: currentConfig.temperature;

			return {
				...currentConfig,
				provider,
				model: defaultModel.model_id,
				temperature,
			};
		}

		// Ultimate fallback: current app config
		return currentConfig;
	}

	// Parse temperature
	const temperature =
		typeof storyTemperature === "string"
			? Number.parseFloat(storyTemperature)
			: typeof storyTemperature === "number"
				? storyTemperature
				: currentConfig.temperature;

	// Use story-specific settings
	console.log(
		`[AI Config] Using story-specific settings: ${provider} / ${storyModel} / temp=${temperature}`,
	);

	return {
		...currentConfig,
		provider,
		model: storyModel,
		temperature,
	};
}
