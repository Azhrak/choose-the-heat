import type { Kysely } from "kysely";

/**
 * Migration 006: Add story branching support
 *
 * Adds:
 * - branched_from_story_id (UUID): Reference to parent story if this is a branch
 * - branched_at_scene (INTEGER): Scene number where the branch occurred
 */
export async function up(db: Kysely<any>): Promise<void> {
	// Add branched_from_story_id column (nullable foreign key to user_stories)
	await db.schema
		.alterTable("user_stories")
		.addColumn("branched_from_story_id", "uuid", (col) =>
			col.references("user_stories.id").onDelete("set null"),
		)
		.execute();

	// Add branched_at_scene column (nullable integer)
	await db.schema
		.alterTable("user_stories")
		.addColumn("branched_at_scene", "integer")
		.execute();

	// Create index on branched_from_story_id for efficient parent story lookups
	await db.schema
		.createIndex("user_stories_branched_from_idx")
		.on("user_stories")
		.column("branched_from_story_id")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop index first
	await db.schema
		.dropIndex("user_stories_branched_from_idx")
		.ifExists()
		.execute();

	// Remove the columns
	await db.schema
		.alterTable("user_stories")
		.dropColumn("branched_from_story_id")
		.execute();

	await db.schema
		.alterTable("user_stories")
		.dropColumn("branched_at_scene")
		.execute();
}
