import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types";

/**
 * Get database connection pool configuration
 */
function getPoolConfig() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL environment variable is not set");
	}

	return {
		connectionString: databaseUrl,
		max: 10, // Maximum number of clients in the pool
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	};
}

/**
 * Create database instance with Kysely
 */
function createDatabase() {
	const dialect = new PostgresDialect({
		pool: new Pool(getPoolConfig()),
	});

	return new Kysely<Database>({
		dialect,
		log(event) {
			if (event.level === "query") {
				console.log("Query:", event.query.sql);
				console.log("Params:", event.query.parameters);
			}
		},
	});
}

// Singleton database instance
export const db = createDatabase();

/**
 * Close database connections (useful for cleanup in tests)
 */
export async function closeDatabase() {
	await db.destroy();
}
