import { db } from "~/lib/db";
import type { AuditEntityType } from "~/lib/db/types";

/**
 * Extract changes between old and new objects
 */
export function extractChanges(
	oldObj: Record<string, any> | null,
	newObj: Record<string, any>,
): Record<string, { old: any; new: any }> {
	const changes: Record<string, { old: any; new: any }> = {};

	// If oldObj is null, all fields in newObj are new
	if (!oldObj) {
		for (const key in newObj) {
			changes[key] = { old: null, new: newObj[key] };
		}
		return changes;
	}

	// Compare each field
	for (const key in newObj) {
		if (oldObj[key] !== newObj[key]) {
			changes[key] = { old: oldObj[key], new: newObj[key] };
		}
	}

	return changes;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: {
	userId: string;
	action: string;
	entityType: AuditEntityType;
	entityId: string;
	changes?: Record<string, any> | null;
}): Promise<void> {
	await db
		.insertInto("admin_audit_logs")
		.values({
			user_id: params.userId,
			action: params.action,
			entity_type: params.entityType,
			entity_id: params.entityId,
			changes: params.changes || null,
		})
		.execute();
}

/**
 * Filters for querying audit logs
 */
export interface AuditLogFilters {
	userId?: string;
	entityType?: AuditEntityType;
	entityId?: string;
	action?: string;
	limit?: number;
	offset?: number;
}

/**
 * Audit log with user information
 */
export interface AuditLogWithUser {
	id: string;
	userId: string;
	userEmail: string;
	userName: string | null;
	action: string;
	entityType: AuditEntityType;
	entityId: string;
	changes: Record<string, any> | null;
	createdAt: Date;
}

/**
 * Get audit logs with filters and pagination
 */
export async function getAuditLogs(
	filters: AuditLogFilters = {},
): Promise<AuditLogWithUser[]> {
	let query = db
		.selectFrom("admin_audit_logs")
		.innerJoin("users", "admin_audit_logs.user_id", "users.id")
		.select([
			"admin_audit_logs.id",
			"admin_audit_logs.user_id as userId",
			"users.email as userEmail",
			"users.name as userName",
			"admin_audit_logs.action",
			"admin_audit_logs.entity_type as entityType",
			"admin_audit_logs.entity_id as entityId",
			"admin_audit_logs.changes",
			"admin_audit_logs.created_at as createdAt",
		])
		.orderBy("admin_audit_logs.created_at", "desc");

	// Apply filters
	if (filters.userId) {
		query = query.where("admin_audit_logs.user_id", "=", filters.userId);
	}

	if (filters.entityType) {
		query = query.where(
			"admin_audit_logs.entity_type",
			"=",
			filters.entityType,
		);
	}

	if (filters.entityId) {
		query = query.where("admin_audit_logs.entity_id", "=", filters.entityId);
	}

	if (filters.action) {
		query = query.where("admin_audit_logs.action", "=", filters.action);
	}

	// Apply pagination
	if (filters.limit) {
		query = query.limit(filters.limit);
	}

	if (filters.offset) {
		query = query.offset(filters.offset);
	}

	const logs = await query.execute();

	return logs.map((log) => ({
		...log,
		changes: log.changes as Record<string, any> | null,
	}));
}

/**
 * Get audit log count with filters
 */
export async function getAuditLogCount(
	filters: Omit<AuditLogFilters, "limit" | "offset"> = {},
): Promise<number> {
	let query = db
		.selectFrom("admin_audit_logs")
		.select(({ fn }) => [fn.count<number>("id").as("count")]);

	// Apply filters
	if (filters.userId) {
		query = query.where("user_id", "=", filters.userId);
	}

	if (filters.entityType) {
		query = query.where("entity_type", "=", filters.entityType);
	}

	if (filters.entityId) {
		query = query.where("entity_id", "=", filters.entityId);
	}

	if (filters.action) {
		query = query.where("action", "=", filters.action);
	}

	const result = await query.executeTakeFirst();
	return Number(result?.count || 0);
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
	entityType: AuditEntityType,
	entityId: string,
	limit = 50,
): Promise<AuditLogWithUser[]> {
	return getAuditLogs({ entityType, entityId, limit });
}

/**
 * Delete audit logs older than the specified number of days
 * Default: 90 days (3 months)
 */
export async function cleanupOldAuditLogs(retentionDays = 90): Promise<number> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

	const result = await db
		.deleteFrom("admin_audit_logs")
		.where("created_at", "<", cutoffDate)
		.executeTakeFirst();

	return Number(result.numDeletedRows || 0);
}
