import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Add AI settings columns to user_stories table
	await db.schema
		.alterTable("user_stories")
		.addColumn("ai_provider", "varchar(50)")
		.addColumn("ai_model", "varchar(255)")
		.addColumn("ai_temperature", "decimal(3, 2)")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove AI settings columns from user_stories table
	await db.schema
		.alterTable("user_stories")
		.dropColumn("ai_provider")
		.dropColumn("ai_model")
		.dropColumn("ai_temperature")
		.execute();
}
