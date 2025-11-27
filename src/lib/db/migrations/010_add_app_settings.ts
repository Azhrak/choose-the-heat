import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Update audit_entity_type enum to include 'setting'
	await sql`ALTER TYPE audit_entity_type ADD VALUE 'setting'`.execute(db);

	// Create app_settings table
	await db.schema
		.createTable("app_settings")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("key", "varchar(255)", (col) => col.notNull().unique())
		.addColumn("value", "text", (col) => col.notNull())
		.addColumn("value_type", "varchar(20)", (col) => col.notNull())
		.addColumn("category", "varchar(50)", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("is_sensitive", "boolean", (col) =>
			col.notNull().defaultTo(false),
		)
		.addColumn("default_value", "text")
		.addColumn("validation_rules", "jsonb")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_by", "uuid", (col) =>
			col.references("users.id").onDelete("set null"),
		)
		.execute();

	// Add check constraint for value_type
	await sql`
    ALTER TABLE app_settings
    ADD CONSTRAINT app_settings_value_type_check
    CHECK (value_type IN ('string', 'number', 'boolean', 'json'))
  `.execute(db);

	// Create indexes
	await db.schema
		.createIndex("app_settings_category_idx")
		.on("app_settings")
		.column("category")
		.execute();

	await db.schema
		.createIndex("app_settings_key_idx")
		.on("app_settings")
		.column("key")
		.execute();

	// Seed initial settings from environment variables and hardcoded defaults
	const settings = [
		// AI & Generation Settings
		{
			key: "ai.provider",
			value: "openrouter",
			value_type: "string",
			category: "ai",
			description: "Active AI provider for story generation",
			is_sensitive: false,
			default_value: "openai",
			validation_rules: JSON.stringify({
				enum: ["openai", "google", "anthropic", "mistral", "xai", "openrouter"],
			}),
		},
		{
			key: "ai.model",
			value: "nousresearch/hermes-3-llama-3.1-70b",
			value_type: "string",
			category: "ai",
			description: "Model name for the active provider",
			is_sensitive: false,
			default_value: "gpt-4o-mini",
			validation_rules: null,
		},
		{
			key: "ai.available_models",
			value: JSON.stringify({
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
					"x-ai/grok-4.1-fast:free",
					"cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
				],
			}),
			value_type: "json",
			category: "ai",
			description:
				"Available models for each provider (JSON object mapping provider to model array)",
			is_sensitive: false,
			default_value: JSON.stringify({
				openai: ["gpt-4o-mini"],
				google: ["gemini-2.5-flash-lite"],
				anthropic: ["claude-3-5-sonnet-20241022"],
				mistral: ["mistral-medium-2508"],
				xai: ["grok-4-fast-reasoning"],
				openrouter: ["openai/gpt-4o-mini"],
			}),
			validation_rules: null,
		},
		{
			key: "ai.temperature",
			value: "0.7",
			value_type: "number",
			category: "ai",
			description: "Creativity level for AI generation (0-2)",
			is_sensitive: false,
			default_value: "0.7",
			validation_rules: JSON.stringify({ min: 0, max: 2 }),
		},
		{
			key: "ai.max_tokens",
			value: "2000",
			value_type: "number",
			category: "ai",
			description: "Maximum tokens per generation",
			is_sensitive: false,
			default_value: "2000",
			validation_rules: JSON.stringify({ min: 100, max: 8000 }),
		},
		{
			key: "ai.fallback_enabled",
			value: "false",
			value_type: "boolean",
			category: "ai",
			description: "Enable automatic fallback on provider error",
			is_sensitive: false,
			default_value: "false",
			validation_rules: null,
		},
		{
			key: "ai.fallback_provider",
			value: "",
			value_type: "string",
			category: "ai",
			description: "Backup provider when fallback is enabled (optional)",
			is_sensitive: false,
			default_value: "",
			validation_rules: JSON.stringify({
				enum: [
					"",
					"openai",
					"google",
					"anthropic",
					"mistral",
					"xai",
					"openrouter",
				],
			}),
		},
		{
			key: "ai.timeout_seconds",
			value: "60",
			value_type: "number",
			category: "ai",
			description: "Generation timeout in seconds",
			is_sensitive: false,
			default_value: "60",
			validation_rules: JSON.stringify({ min: 10, max: 300 }),
		},

		// Prompt Configuration Settings
		{
			key: "prompts.spice_level_1",
			value: "Sweet / clean: no explicit sensual detail.",
			value_type: "string",
			category: "prompts",
			description: "Description for spice level 1 (Sweet/Clean)",
			is_sensitive: false,
			default_value: "Sweet / clean: no explicit sensual detail.",
			validation_rules: null,
		},
		{
			key: "prompts.spice_level_2",
			value: "Mild: romantic tension, light kissing only.",
			value_type: "string",
			category: "prompts",
			description: "Description for spice level 2 (Mild)",
			is_sensitive: false,
			default_value: "Mild: romantic tension, light kissing only.",
			validation_rules: null,
		},
		{
			key: "prompts.spice_level_3",
			value:
				"Moderate: sensuality, implied intimacy; fade before explicit anatomical detail.",
			value_type: "string",
			category: "prompts",
			description: "Description for spice level 3 (Moderate)",
			is_sensitive: false,
			default_value:
				"Moderate: sensuality, implied intimacy; fade before explicit anatomical detail.",
			validation_rules: null,
		},
		{
			key: "prompts.spice_level_4",
			value:
				"Steamy: explicit romantic intimacy with tasteful descriptive detail.",
			value_type: "string",
			category: "prompts",
			description: "Description for spice level 4 (Steamy)",
			is_sensitive: false,
			default_value:
				"Steamy: explicit romantic intimacy with tasteful descriptive detail.",
			validation_rules: null,
		},
		{
			key: "prompts.spice_level_5",
			value:
				"Explicit: detailed intimate scenes, emotionally grounded and consensual.",
			value_type: "string",
			category: "prompts",
			description: "Description for spice level 5 (Explicit)",
			is_sensitive: false,
			default_value:
				"Explicit: detailed intimate scenes, emotionally grounded and consensual.",
			validation_rules: null,
		},
		{
			key: "prompts.pacing_slow_burn",
			value:
				"Gradual escalation: sustained tension, delayed gratification, layered micro-shifts.",
			value_type: "string",
			category: "prompts",
			description: "Description for slow-burn pacing",
			is_sensitive: false,
			default_value:
				"Gradual escalation: sustained tension, delayed gratification, layered micro-shifts.",
			validation_rules: null,
		},
		{
			key: "prompts.pacing_fast_paced",
			value:
				"Brisk escalation: rapid chemistry beats, early sparks, tight scene economy.",
			value_type: "string",
			category: "prompts",
			description: "Description for fast-paced pacing",
			is_sensitive: false,
			default_value:
				"Brisk escalation: rapid chemistry beats, early sparks, tight scene economy.",
			validation_rules: null,
		},
		{
			key: "prompts.consent_rules_1_2",
			value:
				"No explicit anatomical descriptions. Keep intimacy implied or restrained.",
			value_type: "string",
			category: "prompts",
			description: "Consent rules for spice levels 1-2",
			is_sensitive: false,
			default_value:
				"No explicit anatomical descriptions. Keep intimacy implied or restrained.",
			validation_rules: null,
		},
		{
			key: "prompts.consent_rules_3",
			value:
				"Stop before explicit anatomical detail. Focus on sensory suggestion and emotional resonance.",
			value_type: "string",
			category: "prompts",
			description: "Consent rules for spice level 3",
			is_sensitive: false,
			default_value:
				"Stop before explicit anatomical detail. Focus on sensory suggestion and emotional resonance.",
			validation_rules: null,
		},
		{
			key: "prompts.consent_rules_4",
			value:
				"Explicit allowed; maintain emotional context, mutual consent, and aftercare cues when appropriate.",
			value_type: "string",
			category: "prompts",
			description: "Consent rules for spice level 4",
			is_sensitive: false,
			default_value:
				"Explicit allowed; maintain emotional context, mutual consent, and aftercare cues when appropriate.",
			validation_rules: null,
		},
		{
			key: "prompts.consent_rules_5",
			value:
				"Explicit allowed; avoid gratuitous mechanical detail—always tie intimacy to emotion, consent, and character growth.",
			value_type: "string",
			category: "prompts",
			description: "Consent rules for spice level 5",
			is_sensitive: false,
			default_value:
				"Explicit allowed; avoid gratuitous mechanical detail—always tie intimacy to emotion, consent, and character growth.",
			validation_rules: null,
		},
		{
			key: "prompts.content_safety_rules",
			value: `DO NOT include, depict, or imply ANY of the following:
- Characters under 18 years of age in ANY context (romantic, intimate, or otherwise)
- Ambiguous age references—ALL characters must be explicitly adult (18+)
- Non-consensual sexual acts or coercion of any kind
- Incest or pseudo-incest (step-relations, adoptive, "not blood related" scenarios)
- Bestiality or any non-human romantic/sexual content
- Extreme violence, gore, torture, or sadism
- Glamorized self-harm, suicide ideation, or eating disorders
- Illegal activities presented positively
- Racial, ethnic, or discriminatory stereotypes

ALL romantic and intimate characters MUST be clearly established as adults (minimum 18 years old).
Use contextual cues: career, education completion, independent living, mature decision-making.`,
			value_type: "string",
			category: "prompts",
			description: "Content safety rules and prohibited content guidelines",
			is_sensitive: false,
			default_value: `DO NOT include, depict, or imply ANY of the following:
- Characters under 18 years of age in ANY context (romantic, intimate, or otherwise)
- Ambiguous age references—ALL characters must be explicitly adult (18+)
- Non-consensual sexual acts or coercion of any kind
- Incest or pseudo-incest (step-relations, adoptive, "not blood related" scenarios)
- Bestiality or any non-human romantic/sexual content
- Extreme violence, gore, torture, or sadism
- Glamorized self-harm, suicide ideation, or eating disorders
- Illegal activities presented positively
- Racial, ethnic, or discriminatory stereotypes

ALL romantic and intimate characters MUST be clearly established as adults (minimum 18 years old).
Use contextual cues: career, education completion, independent living, mature decision-making.`,
			validation_rules: null,
		},
	];

	// Insert initial settings
	for (const setting of settings) {
		await db
			.insertInto("app_settings")
			.values({
				key: setting.key,
				value: setting.value,
				value_type: setting.value_type,
				category: setting.category,
				description: setting.description,
				is_sensitive: setting.is_sensitive,
				default_value: setting.default_value,
				validation_rules: setting.validation_rules,
			})
			.execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema.dropIndex("app_settings_key_idx").ifExists().execute();

	await db.schema.dropIndex("app_settings_category_idx").ifExists().execute();

	// Drop table
	await db.schema.dropTable("app_settings").ifExists().execute();

	// Note: Cannot easily remove enum value in PostgreSQL
	// The 'setting' value will remain in audit_entity_type enum
	// This is acceptable as it won't cause issues
}
