import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Seed text generation models (all marked as enabled for backward compatibility)
	const textModels = [
		// OpenAI
		{
			provider: "openai",
			category: "text",
			model_id: "gpt-5-mini",
			display_name: "GPT-5 Mini",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openai",
			category: "text",
			model_id: "gpt-5.1",
			display_name: "GPT-5.1",
			status: "enabled",
			supports_streaming: true,
		},
		// Google Gemini
		{
			provider: "google",
			category: "text",
			model_id: "gemini-2.5-flash-lite",
			display_name: "Gemini 2.5 Flash Lite",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "google",
			category: "text",
			model_id: "gemini-2.5-flash",
			display_name: "Gemini 2.5 Flash",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "google",
			category: "text",
			model_id: "gemini-3-flash-preview",
			display_name: "Gemini 3 Flash Preview",
			status: "enabled",
			supports_streaming: true,
		},
		// Anthropic Claude
		{
			provider: "anthropic",
			category: "text",
			model_id: "claude-sonnet-4-5",
			display_name: "Claude Sonnet 4.5",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "anthropic",
			category: "text",
			model_id: "claude-haiku-4-5",
			display_name: "Claude Haiku 4.5",
			status: "enabled",
			supports_streaming: true,
		},
		// Mistral
		{
			provider: "mistral",
			category: "text",
			model_id: "mistral-medium-latest",
			display_name: "Mistral Medium Latest",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "mistral",
			category: "text",
			model_id: "mistral-small-latest",
			display_name: "Mistral Small Latest",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "mistral",
			category: "text",
			model_id: "mistral-large-latest",
			display_name: "Mistral Large Latest",
			status: "enabled",
			supports_streaming: true,
		},
		// xAI Grok
		{
			provider: "xai",
			category: "text",
			model_id: "grok-4-1-fast-reasoning-latest",
			display_name: "Grok 4.1 Fast Reasoning",
			status: "enabled",
			supports_streaming: true,
		},
		// OpenRouter
		{
			provider: "openrouter",
			category: "text",
			model_id: "nex-agi/deepseek-v3.1-nex-n1:free",
			display_name: "DeepSeek V3.1 Nex N1 (via OpenRouter)",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openrouter",
			category: "text",
			model_id: "mistralai/mistral-small-creative",
			display_name: "Mistral Small Creative (via OpenRouter)",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openrouter",
			category: "text",
			model_id: "deepseek/deepseek-v3.2",
			display_name: "DeepSeek V3.2 (via OpenRouter)",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openrouter",
			category: "text",
			model_id: "xiaomi/mimo-v2-flash:free",
			display_name: "Mimo V2 Flash (via OpenRouter)",
			status: "enabled",
			supports_streaming: true,
		},
	];

	// Seed TTS models
	const ttsModels = [
		// OpenAI TTS
		{
			provider: "openai",
			category: "tts",
			model_id: "tts-1",
			display_name: "TTS-1",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openai",
			category: "tts",
			model_id: "tts-1-hd",
			display_name: "TTS-1 HD",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "openai",
			category: "tts",
			model_id: "gpt-4o-mini-tts",
			display_name: "GPT-4o Mini TTS",
			status: "enabled",
			supports_streaming: true,
		},
		// Google TTS
		{
			provider: "google",
			category: "tts",
			model_id: "gemini-2.5-flash-tts",
			display_name: "Gemini 2.5 Flash TTS",
			status: "enabled",
			supports_streaming: true,
		},
		{
			provider: "google",
			category: "tts",
			model_id: "gemini-2.5-flash-lite-preview-tts",
			display_name: "Gemini 2.5 Flash Lite Preview TTS",
			status: "enabled",
			supports_streaming: true,
		},
	];

	// Insert all models
	const allModels = [...textModels, ...ttsModels];

	for (const model of allModels) {
		await db
			.insertInto("ai_models")
			.values({
				provider: model.provider,
				category: model.category,
				model_id: model.model_id,
				display_name: model.display_name,
				status: model.status,
				supports_streaming: model.supports_streaming,
				enabled_at: sql`CURRENT_TIMESTAMP`,
				discovered_at: sql`CURRENT_TIMESTAMP`,
			})
			.execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	// Delete all seeded models
	await db.deleteFrom("ai_models").execute();
}
