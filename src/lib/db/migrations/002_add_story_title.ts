import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Add story_title column to user_stories table
	await db.schema
		.alterTable("user_stories")
		.addColumn("story_title", "varchar(255)", (col) => col)
		.execute();

	// Backfill existing stories with template title
	await sql`
		UPDATE user_stories us
		SET story_title = nt.title
		FROM novel_templates nt
		WHERE us.template_id = nt.id
		AND us.story_title IS NULL
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable("user_stories")
		.dropColumn("story_title")
		.execute();
}
