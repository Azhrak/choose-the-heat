import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Remove ai.model and tts.model settings since we now use dynamic default models
	await db
		.deleteFrom("app_settings")
		.where("key", "in", ["ai.model", "tts.model"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Re-add the settings with default values if rolling back
	await db
		.insertInto("app_settings")
		.values([
			{
				key: "ai.model",
				value: "gpt-4o-mini",
				value_type: "string",
				category: "ai",
				description: "Model name for the active provider",
				is_sensitive: false,
				default_value: "gpt-4o-mini",
			},
			{
				key: "tts.model",
				value: "tts-1",
				value_type: "string",
				category: "tts",
				description: "TTS model name for the active provider",
				is_sensitive: false,
				default_value: "tts-1",
			},
		])
		.execute();
}
