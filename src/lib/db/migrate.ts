import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	Kysely,
	Migrator,
	PostgresDialect,
	type Migration,
	type MigrationProvider,
} from "kysely";
import { Pool } from "pg";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Custom migration provider that works cross-platform (Windows, Linux, macOS)
 * Converts file paths to file:// URLs to avoid ESM loader issues with dynamic imports
 */
class CustomFileMigrationProvider implements MigrationProvider {
	constructor(private migrationFolder: string) {}

	async getMigrations(): Promise<Record<string, Migration>> {
		const migrations: Record<string, Migration> = {};
		const files = await fs.readdir(this.migrationFolder);

		for (const fileName of files) {
			if (
				fileName.endsWith(".ts") ||
				(fileName.endsWith(".js") && !fileName.endsWith(".d.ts"))
			) {
				const migrationKey = fileName.substring(0, fileName.lastIndexOf("."));
				const filePath = path.join(this.migrationFolder, fileName);
				// Convert platform-specific path to file:// URL (works on Windows, Linux, macOS)
				const fileUrl = pathToFileURL(filePath).href;
				const migration = await import(fileUrl);
				migrations[migrationKey] = migration;
			}
		}

		return migrations;
	}
}

async function migrateToLatest() {
	// Create database connection
	const db = new Kysely<any>({
		dialect: new PostgresDialect({
			pool: new Pool({
				connectionString: process.env.DATABASE_URL,
			}),
		}),
	});

	const migrator = new Migrator({
		db,
		provider: new CustomFileMigrationProvider(
			path.join(__dirname, "migrations"),
		),
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(
				`✅ Migration "${it.migrationName}" was executed successfully`,
			);
		} else if (it.status === "Error") {
			console.error(`❌ Failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("❌ Failed to migrate");
		console.error(error);
		process.exit(1);
	}

	console.log("✅ All migrations executed successfully");

	await db.destroy();
}

migrateToLatest();
