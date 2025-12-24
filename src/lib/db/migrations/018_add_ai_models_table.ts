import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create ai_models table for dynamic model management
	await db.schema
		.createTable("ai_models")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		// Core identification
		.addColumn("provider", "varchar(50)", (col) => col.notNull())
		.addColumn("category", "varchar(20)", (col) => col.notNull())
		.addColumn("model_id", "varchar(255)", (col) => col.notNull())
		// Model metadata
		.addColumn("display_name", "varchar(255)")
		.addColumn("description", "text")
		.addColumn("context_window", "integer")
		.addColumn("supports_streaming", "boolean", (col) => col.defaultTo(true))
		// Lifecycle management
		.addColumn("status", "varchar(20)", (col) =>
			col.notNull().defaultTo("pending"),
		)
		.addColumn("discovered_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("enabled_at", "timestamp")
		.addColumn("deprecated_at", "timestamp")
		// Provider metadata (raw API response)
		.addColumn("provider_metadata", "jsonb")
		// Admin notes
		.addColumn("admin_notes", "text")
		// Timestamps
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

	// Add constraints
	await db.schema
		.alterTable("ai_models")
		.addCheckConstraint(
			"ai_models_category_check",
			sql`category IN ('text', 'tts')`,
		)
		.execute();

	await db.schema
		.alterTable("ai_models")
		.addCheckConstraint(
			"ai_models_status_check",
			sql`status IN ('pending', 'enabled', 'disabled', 'deprecated')`,
		)
		.execute();

	await db.schema
		.alterTable("ai_models")
		.addUniqueConstraint("ai_models_provider_category_model_unique", [
			"provider",
			"category",
			"model_id",
		])
		.execute();

	// Create indexes for fast lookups
	await db.schema
		.createIndex("idx_ai_models_provider_category")
		.on("ai_models")
		.columns(["provider", "category"])
		.execute();

	await db.schema
		.createIndex("idx_ai_models_status")
		.on("ai_models")
		.column("status")
		.execute();

	await db.schema
		.createIndex("idx_ai_models_discovered_at")
		.on("ai_models")
		.column("discovered_at")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes first
	await db.schema.dropIndex("idx_ai_models_discovered_at").execute();
	await db.schema.dropIndex("idx_ai_models_status").execute();
	await db.schema.dropIndex("idx_ai_models_provider_category").execute();

	// Drop the ai_models table
	await db.schema.dropTable("ai_models").execute();
}
