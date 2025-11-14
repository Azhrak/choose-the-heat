import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create user role enum type
	await sql`
    CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin')
  `.execute(db);

	// Add role column to users table with default 'user'
	await db.schema
		.alterTable("users")
		.addColumn("role", sql`user_role`, (col) =>
			col.notNull().defaultTo(sql`'user'::user_role`),
		)
		.execute();

	// Create template status enum type
	await sql`
    CREATE TYPE template_status AS ENUM ('draft', 'published', 'archived')
  `.execute(db);

	// Add status column to novel_templates table with default 'published'
	await db.schema
		.alterTable("novel_templates")
		.addColumn("status", sql`template_status`, (col) =>
			col.notNull().defaultTo(sql`'published'::template_status`),
		)
		.execute();

	// Add archived_at timestamp to track when template was archived
	await db.schema
		.alterTable("novel_templates")
		.addColumn("archived_at", "timestamp")
		.execute();

	// Add archived_by to track who archived the template
	await db.schema
		.alterTable("novel_templates")
		.addColumn("archived_by", "uuid", (col) =>
			col.references("users.id").onDelete("set null"),
		)
		.execute();

	// Create index on role for efficient querying
	await db.schema
		.createIndex("users_role_idx")
		.on("users")
		.column("role")
		.execute();

	// Create index on status for efficient filtering
	await db.schema
		.createIndex("novel_templates_status_idx")
		.on("novel_templates")
		.column("status")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema.dropIndex("novel_templates_status_idx").ifExists().execute();
	await db.schema.dropIndex("users_role_idx").ifExists().execute();

	// Drop columns from novel_templates
	await db.schema
		.alterTable("novel_templates")
		.dropColumn("archived_by")
		.execute();

	await db.schema
		.alterTable("novel_templates")
		.dropColumn("archived_at")
		.execute();

	await db.schema.alterTable("novel_templates").dropColumn("status").execute();

	// Drop column from users
	await db.schema.alterTable("users").dropColumn("role").execute();

	// Drop enum types
	await sql`DROP TYPE IF EXISTS template_status`.execute(db);
	await sql`DROP TYPE IF EXISTS user_role`.execute(db);
}
