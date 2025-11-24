import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Add cover_url column to novel_templates table
	await db.schema
		.alterTable("novel_templates")
		.addColumn("cover_url", "text")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove cover_url column from novel_templates table
	await db.schema
		.alterTable("novel_templates")
		.dropColumn("cover_url")
		.execute();
}
