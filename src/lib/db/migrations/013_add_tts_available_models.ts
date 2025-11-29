import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Add tts.available_models setting
	await db
		.insertInto("app_settings")
		.values({
			category: "tts",
			key: "tts.available_models",
			value: JSON.stringify({
				openai: ["tts-1", "tts-1-hd", "gpt-4o-mini-tts"],
				google: [
					"gemini-2.5-pro-tts",
					"gemini-2.5-flash-tts",
					"gemini-2.5-flash-lite-preview-tts",
				],
				elevenlabs: [
					"eleven_multilingual_v2",
					"eleven_turbo_v2_5",
					"eleven_v3",
				],
				azure: ["default"],
			}),
			value_type: "json",
			description:
				"Available models/voices for each TTS provider (JSON object mapping provider to model array)",
			is_sensitive: false,
			default_value: JSON.stringify({
				openai: ["tts-1"],
				google: ["gemini-2.5-flash-tts"],
				elevenlabs: ["eleven_multilingual_v2"],
				azure: ["default"],
			}),
		})
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove tts.available_models setting
	await db
		.deleteFrom("app_settings")
		.where("key", "=", "tts.available_models")
		.execute();
}
