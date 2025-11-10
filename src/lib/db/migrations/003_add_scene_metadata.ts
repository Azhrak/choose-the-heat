import { type Kysely, sql } from "kysely";

/**
 * Migration 003: Add metadata and summary to scenes table
 * 
 * Adds:
 * - metadata (JSONB): Structured scene metadata (emotional_beat, tension_threads, relationship_progress)
 * - summary (TEXT): Generated summary for context in future scenes
 */
export async function up(db: Kysely<any>): Promise<void> {
	// Add metadata column (JSONB for structured data)
	await db.schema
		.alterTable("scenes")
		.addColumn("metadata", "jsonb")
		.execute();

	// Add summary column (TEXT for generated summary)
	await db.schema
		.alterTable("scenes")
		.addColumn("summary", "text")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove the columns
	await db.schema
		.alterTable("scenes")
		.dropColumn("metadata")
		.execute();

	await db.schema
		.alterTable("scenes")
		.dropColumn("summary")
		.execute();
}
