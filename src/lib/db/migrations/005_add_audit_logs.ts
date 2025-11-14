import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create entity type enum for audit logs
	await sql`
    CREATE TYPE audit_entity_type AS ENUM ('template', 'user')
  `.execute(db);

	// Create admin_audit_logs table
	await db.schema
		.createTable("admin_audit_logs")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("action", "varchar(255)", (col) => col.notNull())
		.addColumn("entity_type", sql`audit_entity_type`, (col) => col.notNull())
		.addColumn("entity_id", "varchar(255)", (col) => col.notNull())
		.addColumn("changes", "jsonb")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.execute();

	// Create index on created_at for cleanup queries and chronological sorting
	await db.schema
		.createIndex("admin_audit_logs_created_at_idx")
		.on("admin_audit_logs")
		.column("created_at")
		.execute();

	// Create index on user_id for filtering by user
	await db.schema
		.createIndex("admin_audit_logs_user_id_idx")
		.on("admin_audit_logs")
		.column("user_id")
		.execute();

	// Create index on entity_type for filtering by entity type
	await db.schema
		.createIndex("admin_audit_logs_entity_type_idx")
		.on("admin_audit_logs")
		.column("entity_type")
		.execute();

	// Create composite index for common query patterns (entity lookups)
	await db.schema
		.createIndex("admin_audit_logs_entity_idx")
		.on("admin_audit_logs")
		.columns(["entity_type", "entity_id"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes
	await db.schema.dropIndex("admin_audit_logs_entity_idx").ifExists().execute();
	await db.schema
		.dropIndex("admin_audit_logs_entity_type_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("admin_audit_logs_user_id_idx")
		.ifExists()
		.execute();
	await db.schema
		.dropIndex("admin_audit_logs_created_at_idx")
		.ifExists()
		.execute();

	// Drop table
	await db.schema.dropTable("admin_audit_logs").ifExists().execute();

	// Drop enum type
	await sql`DROP TYPE IF EXISTS audit_entity_type`.execute(db);
}
