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
 */
function getConfigFromEnv(): TTSConfig {
	const provider = (
		process.env.TTS_PROVIDER || "openai"
	).toLowerCase() as TTSProvider;

	return {
		provider,
		model: process.env.TTS_MODEL || "tts-1",
		gcsBucketName: process.env.GCS_BUCKET_NAME || "",
		gcsBucketPath: process.env.GCS_BUCKET_PATH || "audio/",
		availableModels: {
			openai: ["tts-1", "tts-1-hd"],
			google: [
				"en-US-Neural2-A",
				"en-US-Neural2-C",
				"en-US-Neural2-D",
				"en-US-Neural2-F",
			],
			elevenlabs: ["Rachel", "Domi"],
			azure: ["en-US-JennyNeural", "en-US-GuyNeural", "en-US-AriaNeural"],
		},
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
					id: "en-US-Neural2-A",
					name: "US Female (Neural2-A)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "en-US-Neural2-C",
					name: "US Female (Neural2-C)",
					language: "en-US",
					gender: "female",
				},
				{
					id: "en-US-Neural2-D",
					name: "US Male (Neural2-D)",
					language: "en-US",
					gender: "male",
				},
				{
					id: "en-US-Neural2-F",
					name: "US Female (Neural2-F)",
					language: "en-US",
					gender: "female",
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
function parseSettings(settings: Record<string, string>): TTSConfig {
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

	const config = {
		provider: (settings["tts.provider"] || envFallback.provider) as TTSProvider,
		model: settings["tts.model"] || envFallback.model,
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

	try {
		// Try to load from database
		const settings = await getSettingsMap({ category: "tts" });

		if (Object.keys(settings).length > 0) {
			const config = parseSettings(settings);

			// Update cache
			cache.data = config;
			cache.timestamp = now;

			return config;
		}
	} catch (error) {
		console.error("Failed to load TTS settings from database:", error);
	}

	// Fall back to environment variables
	const envConfig = getConfigFromEnv();

	// Cache env config as well
	cache.data = envConfig;
	cache.timestamp = now;

	return envConfig;
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
