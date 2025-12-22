import type { Kysely } from "kysely";

/**
 * Migration: Add default model settings for each provider
 *
 * This allows each provider to have its own default model setting,
 * separate from the currently active provider/model combination.
 */
export async function up(db: Kysely<any>): Promise<void> {
	// Default model settings for AI text providers
	const aiProviderDefaults = [
		{
			key: "ai.openai.default_model",
			value: "gpt-4o-mini",
			description: "Default model for OpenAI provider",
		},
		{
			key: "ai.google.default_model",
			value: "gemini-2.5-flash-lite",
			description: "Default model for Google Gemini provider",
		},
		{
			key: "ai.anthropic.default_model",
			value: "claude-4-5-haiku",
			description: "Default model for Anthropic Claude provider",
		},
		{
			key: "ai.mistral.default_model",
			value: "mistral-medium-latest",
			description: "Default model for Mistral AI provider",
		},
		{
			key: "ai.xai.default_model",
			value: "grok-4-fast-reasoning",
			description: "Default model for xAI Grok provider",
		},
		{
			key: "ai.openrouter.default_model",
			value: "openai/gpt-4o-mini",
			description: "Default model for OpenRouter provider",
		},
	];

	// Default model settings for TTS providers
	const ttsProviderDefaults = [
		{
			key: "tts.openai.default_model",
			value: "tts-1",
			description: "Default model for OpenAI TTS provider",
		},
		{
			key: "tts.google.default_model",
			value: "gemini-2.5-flash-tts",
			description: "Default model for Google TTS provider",
		},
		{
			key: "tts.elevenlabs.default_model",
			value: "Rachel",
			description: "Default model for ElevenLabs provider",
		},
		{
			key: "tts.azure.default_model",
			value: "en-US-JennyNeural",
			description: "Default model for Azure TTS provider",
		},
	];

	// Insert AI provider default model settings
	for (const setting of aiProviderDefaults) {
		await db
			.insertInto("app_settings")
			.values({
				key: setting.key,
				value: setting.value,
				value_type: "string",
				category: "ai",
				description: setting.description,
				is_sensitive: false,
				default_value: setting.value,
				validation_rules: null,
			})
			.onConflict((oc) => oc.column("key").doNothing())
			.execute();
	}

	// Insert TTS provider default model settings
	for (const setting of ttsProviderDefaults) {
		await db
			.insertInto("app_settings")
			.values({
				key: setting.key,
				value: setting.value,
				value_type: "string",
				category: "tts",
				description: setting.description,
				is_sensitive: false,
				default_value: setting.value,
				validation_rules: null,
			})
			.onConflict((oc) => oc.column("key").doNothing())
			.execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove default model settings for all providers
	await db
		.deleteFrom("app_settings")
		.where("key", "like", "ai.%.default_model")
		.execute();

	await db
		.deleteFrom("app_settings")
		.where("key", "like", "tts.%.default_model")
		.execute();
}
