import { getAllTTSProviders } from "../ai/providers";
import { getDefaultModelForProvider } from "../db/queries/aiModels";
import { getSettingsMap } from "../db/queries/settings";

/**
 * TTS Provider types
 */
export type TTSProvider = "openai" | "google" | "elevenlabs" | "azure";

/**
 * Voice configuration
 */
export interface Voice {
	id: string;
	name: string;
	language?: string;
	gender?: string;
}

/**
 * TTS Configuration from settings
 */
export interface TTSConfig {
	provider: TTSProvider;
	model: string;
	gcsBucketName: string;
	gcsBucketPath: string;
	availableVoices: Record<TTSProvider, Voice[]>;
	availableModels: Record<TTSProvider, string[]>;
}

/**
 * In-memory cache for settings
 */
interface SettingsCache {
	data: TTSConfig | null;
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
export function invalidateTTSCache(): void {
	cache.data = null;
	cache.timestamp = 0;
}

/**
 * Get TTS configuration from environment variables
 * Used as fallback when database settings are not available
 * Now uses provider registry as single source of truth for models
 */
function getConfigFromEnv(): TTSConfig {
	const providers = getAllTTSProviders();
	const provider = (
		process.env.TTS_PROVIDER || "openai"
	).toLowerCase() as TTSProvider;

	// Build available models from provider registry
	const availableModels: Record<TTSProvider, string[]> = {} as Record<
		TTSProvider,
		string[]
	>;
	for (const p of providers) {
		availableModels[p.id as TTSProvider] = p.supportedModels;
	}

	// Get model from env or provider default
	const providerMeta = providers.find((p) => p.id === provider);
	const model = process.env.TTS_MODEL || providerMeta?.defaultModel || "tts-1";

	return {
		provider,
		model,
		gcsBucketName: process.env.GCS_BUCKET_NAME || "",
		gcsBucketPath: process.env.GCS_BUCKET_PATH || "audio/",
		availableModels,
		availableVoices: {
			openai: [
				{ id: "alloy", name: "Alloy" },
				{ id: "echo", name: "Echo" },
				{ id: "fable", name: "Fable" },
				{ id: "onyx", name: "Onyx" },
				{ id: "nova", name: "Nova" },
				{ id: "shimmer", name: "Shimmer" },
			],
			google: [
				{
					id: "Enceladus",
					name: "Enceladus (Male)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "Puck",
					name: "Puck (Male)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "Charon",
					name: "Charon (Male)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "Kore",
					name: "Kore (Female)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "Fenrir",
					name: "Fenrir (Male)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "Aoede",
					name: "Aoede (Female)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "Achernar",
					name: "Achernar (Female)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "Zephyr",
					name: "Zephyr (Female)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "Orus",
					name: "Orus (Male)",
					language: "en-US",
					gender: "male",
				},
			],
			elevenlabs: [
				// ElevenLabs voices are fetched dynamically from API
				{ id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
				{ id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
			],
			azure: [
				{
					id: "en-US-JennyNeural",
					name: "Jenny (Neural)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "en-US-GuyNeural",
					name: "Guy (Neural)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "en-US-AriaNeural",
					name: "Aria (Neural)",
					language: "en-US",
					gender: "female",
				},
			],
		},
	};
}

/**
 * Parse settings from database into TTSConfig
 */
async function parseSettings(
	settings: Record<string, string>,
): Promise<TTSConfig> {
	const envFallback = getConfigFromEnv();

	// Parse available models JSON
	let availableModels = envFallback.availableModels;
	try {
		if (settings["tts.available_models"]) {
			availableModels = JSON.parse(settings["tts.available_models"]);
		}
	} catch (error) {
		console.error("Failed to parse tts.available_models:", error);
	}

	const provider = (settings["tts.provider"] ||
		envFallback.provider) as TTSProvider;

	// Get the default model for this provider from the database
	let model = envFallback.model;
	const defaultModel = await getDefaultModelForProvider(provider, "tts");
	if (defaultModel && defaultModel.status === "enabled") {
		model = defaultModel.model_id;
	}

	const config = {
		provider,
		model,
		gcsBucketName: settings["tts.gcs_bucket_name"] || envFallback.gcsBucketName,
		gcsBucketPath: settings["tts.gcs_bucket_path"] || envFallback.gcsBucketPath,
		availableVoices: envFallback.availableVoices, // Use env default for voices
		availableModels,
	};

	console.log("[TTS Config] Parsed settings:", {
		provider: config.provider,
		model: config.model,
		settingsKeys: Object.keys(settings),
	});

	return config;
}

/**
 * Get TTS configuration
 * Uses the following priority:
 * 1. In-memory cache (if fresh)
 * 2. Database settings
 * 3. Environment variables
 */
export async function getTTSConfig(): Promise<TTSConfig> {
	// Check cache
	const now = Date.now();
	if (cache.data && now - cache.timestamp < CACHE_TTL) {
		return cache.data;
	}

	let config: TTSConfig;

	try {
		// Try to load from database
		const settings = await getSettingsMap({ category: "tts" });

		if (Object.keys(settings).length > 0) {
			config = await parseSettings(settings);

			// Update cache
			cache.data = config;
			cache.timestamp = now;

			return config;
		}
	} catch (error) {
		console.error("Failed to load TTS settings from database:", error);
	}

	// Fall back to environment variables
	config = getConfigFromEnv();

	// Cache env config as well
	cache.data = config;
	cache.timestamp = now;

	return config;
}

/**
 * Get TTS configuration for a specific story, with fallback to current settings
 * If the story has saved TTS settings, use those
 * Otherwise, use the current app settings
 */
export async function getTTSConfigForStory(
	storyProvider?: string | null,
	storyVoiceId?: string | null,
): Promise<{
	provider: TTSProvider;
	voiceId?: string;
	config: TTSConfig;
}> {
	const currentConfig = await getTTSConfig();

	// If no story-specific settings, use current config
	if (!storyProvider) {
		return {
			provider: currentConfig.provider,
			config: currentConfig,
		};
	}

	// Use story-specific provider if valid
	const provider = storyProvider as TTSProvider;
	if (!currentConfig.availableVoices[provider]) {
		console.log(
			`[TTS Config] Story provider "${provider}" no longer available, falling back to current provider "${currentConfig.provider}"`,
		);
		return {
			provider: currentConfig.provider,
			config: currentConfig,
		};
	}

	// Use story-specific settings
	console.log(
		`[TTS Config] Using story-specific settings: ${provider} / ${storyVoiceId || "default"}`,
	);

	return {
		provider,
		voiceId: storyVoiceId || undefined,
		config: currentConfig,
	};
}

/**
 * Get available voices for a specific provider
 */
export async function getAvailableVoices(
	provider?: TTSProvider,
): Promise<Voice[]> {
	const config = await getTTSConfig();

	if (provider) {
		return config.availableVoices[provider] || [];
	}

	// Return voices for current provider
	return config.availableVoices[config.provider] || [];
}

/**
 * Get default model for a specific TTS provider
 * Checks setting tts.<provider>.default_model first, falls back to available_models
 */
export async function getDefaultModelForTTSProvider(
	provider: TTSProvider,
): Promise<string> {
	const settings = await getSettingsMap({ category: "tts" });

	// Check for provider-specific default
	const providerDefault = settings[`tts.${provider}.default_model`];
	if (providerDefault) {
		return providerDefault;
	}

	// Fall back to first available model
	const config = await getTTSConfig();
	const models = config.availableModels[provider];
	if (models && models.length > 0) {
		return models[0];
	}

	// Last resort: use provider registry default
	const providers = getAllTTSProviders();
	const providerMeta = providers.find((p) => p.id === provider);
	return providerMeta?.defaultModel || "tts-1";
}
