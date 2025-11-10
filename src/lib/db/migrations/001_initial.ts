import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Enable UUID extension
	await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

	// Users table
	await db.schema
		.createTable("users")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("email", "varchar(255)", (col) => col.notNull().unique())
		.addColumn("name", "varchar(255)")
		.addColumn("avatar_url", "text")
		.addColumn("default_preferences", "jsonb")
		.addColumn("email_verified", "boolean", (col) =>
			col.notNull().defaultTo(false),
		)
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// OAuth accounts table
	await db.schema
		.createTable("oauth_accounts")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("provider", "varchar(50)", (col) => col.notNull())
		.addColumn("provider_user_id", "varchar(255)", (col) => col.notNull())
		.addColumn("access_token", "text")
		.addColumn("refresh_token", "text")
		.addColumn("expires_at", "timestamp")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create unique index on provider + provider_user_id
	await db.schema
		.createIndex("oauth_accounts_provider_user_idx")
		.on("oauth_accounts")
		.columns(["provider", "provider_user_id"])
		.unique()
		.execute();

	// Password accounts table
	await db.schema
		.createTable("password_accounts")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade").unique(),
		)
		.addColumn("hashed_password", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Sessions table
	await db.schema
		.createTable("sessions")
		.addColumn("id", "varchar(255)", (col) => col.primaryKey())
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("expires_at", "timestamp", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create index on user_id for sessions
	await db.schema
		.createIndex("sessions_user_id_idx")
		.on("sessions")
		.column("user_id")
		.execute();

	// Novel templates table
	await db.schema
		.createTable("novel_templates")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("title", "varchar(255)", (col) => col.notNull())
		.addColumn("description", "text", (col) => col.notNull())
		.addColumn("base_tropes", sql`text[]`, (col) => col.notNull())
		.addColumn("estimated_scenes", "integer", (col) => col.notNull())
		.addColumn("cover_gradient", "varchar(100)", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Choice points table
	await db.schema
		.createTable("choice_points")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("template_id", "uuid", (col) =>
			col.notNull().references("novel_templates.id").onDelete("cascade"),
		)
		.addColumn("scene_number", "integer", (col) => col.notNull())
		.addColumn("prompt_text", "text", (col) => col.notNull())
		.addColumn("options", "jsonb", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create index on template_id + scene_number
	await db.schema
		.createIndex("choice_points_template_scene_idx")
		.on("choice_points")
		.columns(["template_id", "scene_number"])
		.execute();

	// User stories table
	await db.schema
		.createTable("user_stories")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("template_id", "uuid", (col) =>
			col.notNull().references("novel_templates.id").onDelete("restrict"),
		)
		.addColumn("preferences", "jsonb", (col) => col.notNull())
		.addColumn("current_scene", "integer", (col) => col.notNull().defaultTo(1))
		.addColumn("status", "varchar(20)", (col) =>
			col.notNull().defaultTo("in-progress"),
		)
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create indexes for user stories
	await db.schema
		.createIndex("user_stories_user_id_idx")
		.on("user_stories")
		.column("user_id")
		.execute();

	await db.schema
		.createIndex("user_stories_status_idx")
		.on("user_stories")
		.column("status")
		.execute();

	// Choices table
	await db.schema
		.createTable("choices")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("story_id", "uuid", (col) =>
			col.notNull().references("user_stories.id").onDelete("cascade"),
		)
		.addColumn("choice_point_id", "uuid", (col) =>
			col.notNull().references("choice_points.id").onDelete("cascade"),
		)
		.addColumn("selected_option", "integer", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create index on story_id for choices
	await db.schema
		.createIndex("choices_story_id_idx")
		.on("choices")
		.column("story_id")
		.execute();

	// Scenes table
	await db.schema
		.createTable("scenes")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("story_id", "uuid", (col) =>
			col.notNull().references("user_stories.id").onDelete("cascade"),
		)
		.addColumn("scene_number", "integer", (col) => col.notNull())
		.addColumn("content", "text", (col) => col.notNull())
		.addColumn("word_count", "integer", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create unique index on story_id + scene_number (cache key)
	await db.schema
		.createIndex("scenes_story_scene_idx")
		.on("scenes")
		.columns(["story_id", "scene_number"])
		.unique()
		.execute();

	// Add check constraint for status values
	await sql`
    ALTER TABLE user_stories
    ADD CONSTRAINT user_stories_status_check
    CHECK (status IN ('in-progress', 'completed'))
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop tables in reverse order
	await db.schema.dropTable("scenes").ifExists().execute();
	await db.schema.dropTable("choices").ifExists().execute();
	await db.schema.dropTable("user_stories").ifExists().execute();
	await db.schema.dropTable("choice_points").ifExists().execute();
	await db.schema.dropTable("novel_templates").ifExists().execute();
	await db.schema.dropTable("sessions").ifExists().execute();
	await db.schema.dropTable("password_accounts").ifExists().execute();
	await db.schema.dropTable("oauth_accounts").ifExists().execute();
	await db.schema.dropTable("users").ifExists().execute();
}
