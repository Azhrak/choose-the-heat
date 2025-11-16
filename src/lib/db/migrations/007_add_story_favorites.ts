import type { Kysely } from "kysely";

/**
 * Migration 007: Add story favorites support
 *
 * Adds:
 * - favorited_at (TIMESTAMP): When the story was marked as favorite (null if not favorited)
 */
export async function up(db: Kysely<any>): Promise<void> {
	// Add favorited_at column (nullable timestamp)
	await db.schema
		.alterTable("user_stories")
		.addColumn("favorited_at", "timestamp")
		.execute();

	// Create index on favorited_at for efficient filtering
	await db.schema
		.createIndex("user_stories_favorited_at_idx")
		.on("user_stories")
		.column("favorited_at")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop index first
	await db.schema
		.dropIndex("user_stories_favorited_at_idx")
		.ifExists()
		.execute();

	// Remove the column
	await db.schema
		.alterTable("user_stories")
		.dropColumn("favorited_at")
		.execute();
}
