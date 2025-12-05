import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// Create api_keys table for encrypted API key storage
	await db.schema
		.createTable("api_keys")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
		)
		.addColumn("provider", "varchar(50)", (col) => col.notNull().unique())
		.addColumn("encrypted_key", "text", (col) => col.notNull())
		.addColumn("iv", "varchar(32)", (col) => col.notNull())
		.addColumn("auth_tag", "varchar(32)", (col) => col.notNull())
		.addColumn("encryption_version", "integer", (col) =>
			col.notNull().defaultTo(1),
		)
		.addColumn("last_tested_at", "timestamp")
		.addColumn("test_status", "varchar(20)")
		.addColumn("test_error", "text")
		.addColumn("created_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
		)
		.addColumn("created_by", "uuid", (col) =>
			col.references("users.id").onDelete("set null"),
		)
		.addColumn("updated_by", "uuid", (col) =>
			col.references("users.id").onDelete("set null"),
		)
		.execute();

	// Create index on provider for fast lookups
	await db.schema
		.createIndex("idx_api_keys_provider")
		.on("api_keys")
		.column("provider")
		.execute();

	// Create index on test_status for monitoring
	await db.schema
		.createIndex("idx_api_keys_test_status")
		.on("api_keys")
		.column("test_status")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop indexes first
	await db.schema.dropIndex("idx_api_keys_test_status").execute();
	await db.schema.dropIndex("idx_api_keys_provider").execute();

	// Drop the api_keys table
	await db.schema.dropTable("api_keys").execute();
}
