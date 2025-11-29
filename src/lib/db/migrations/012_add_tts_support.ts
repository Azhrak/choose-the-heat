import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create scene_audio table
	await db.schema
		.createTable("scene_audio")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("story_id", "uuid", (col) =>
			col.references("user_stories.id").onDelete("cascade").notNull(),
		)
		.addColumn("scene_number", "integer", (col) => col.notNull())
		.addColumn("audio_url", "text", (col) => col.notNull())
		.addColumn("file_size", "integer", (col) => col.notNull())
		.addColumn("duration", "decimal(10, 2)", (col) => col.notNull())
		.addColumn("tts_provider", "varchar(50)", (col) => col.notNull())
		.addColumn("voice_id", "varchar(255)", (col) => col.notNull())
		.addColumn("voice_name", "varchar(255)", (col) => col.notNull())
		.addColumn("generated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Add unique constraint on (story_id, scene_number)
	await db.schema
		.createIndex("scene_audio_story_scene_idx")
		.on("scene_audio")
		.unique()
		.columns(["story_id", "scene_number"])
		.execute();

	// Add index for faster lookups
	await db.schema
		.createIndex("scene_audio_story_id_idx")
		.on("scene_audio")
		.column("story_id")
		.execute();

	// Add TTS columns to user_stories table
	await db.schema
		.alterTable("user_stories")
		.addColumn("tts_provider", "varchar(50)")
		.addColumn("tts_voice_id", "varchar(255)")
		.addColumn("tts_voice_name", "varchar(255)")
		.execute();

	// Add TTS columns to users table
	await db.schema
		.alterTable("users")
		.addColumn("default_tts_provider", "varchar(50)")
		.addColumn("default_tts_voice_id", "varchar(255)")
		.addColumn("default_tts_voice_name", "varchar(255)")
		.execute();

	// Seed app_settings with TTS defaults
	await db
		.insertInto("app_settings")
		.values([
			{
				category: "tts",
				key: "tts.provider",
				value: "openai",
				value_type: "string",
				description: "Default TTS provider",
				is_sensitive: false,
				default_value: "openai",
			},
			{
				category: "tts",
				key: "tts.model",
				value: "tts-1",
				value_type: "string",
				description: "Default TTS model",
				is_sensitive: false,
				default_value: "tts-1",
			},
			{
				category: "tts",
				key: "tts.gcs_bucket_name",
				value: "",
				value_type: "string",
				description: "Google Cloud Storage bucket name for audio files",
				is_sensitive: false,
				default_value: "",
			},
			{
				category: "tts",
				key: "tts.gcs_bucket_path",
				value: "audio/",
				value_type: "string",
				description: "Path prefix within GCS bucket",
				is_sensitive: false,
				default_value: "audio/",
			},
		])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove TTS settings from app_settings
	await db.deleteFrom("app_settings").where("category", "=", "tts").execute();

	// Remove TTS columns from users table
	await db.schema
		.alterTable("users")
		.dropColumn("default_tts_provider")
		.dropColumn("default_tts_voice_id")
		.dropColumn("default_tts_voice_name")
		.execute();

	// Remove TTS columns from user_stories table
	await db.schema
		.alterTable("user_stories")
		.dropColumn("tts_provider")
		.dropColumn("tts_voice_id")
		.dropColumn("tts_voice_name")
		.execute();

	// Drop scene_audio table (indices are dropped automatically)
	await db.schema.dropTable("scene_audio").execute();
}
