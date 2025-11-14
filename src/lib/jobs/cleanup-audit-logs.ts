import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { db } from "../db";
import { cleanupOldAuditLogs } from "../db/queries/audit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Cleanup script for deleting audit logs older than the retention period
 * Default retention: 90 days (3 months)
 *
 * Usage:
 *   pnpm cleanup:audit-logs        # Use default 90-day retention
 *   pnpm cleanup:audit-logs 30     # Use custom 30-day retention
 */
async function cleanup() {
	try {
		// Get retention days from command line argument or use default (90 days)
		const retentionDays = process.argv[2]
			? Number.parseInt(process.argv[2], 10)
			: 90;

		if (Number.isNaN(retentionDays) || retentionDays <= 0) {
			console.error(
				"❌ Invalid retention days. Please provide a positive number.",
			);
			process.exit(1);
		}

		console.log(
			`🧹 Cleaning up audit logs older than ${retentionDays} days...`,
		);

		const deletedCount = await cleanupOldAuditLogs(retentionDays);

		console.log(`✅ Deleted ${deletedCount} audit log(s)`);

		if (deletedCount === 0) {
			console.log(`ℹ️  No audit logs found older than ${retentionDays} days`);
		}
	} catch (error) {
		console.error("❌ Error cleaning up audit logs:", error);
		throw error;
	} finally {
		await db.destroy();
	}
}

cleanup();
