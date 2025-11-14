import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { AuditEntityType } from "~/lib/db/types";

interface AuditLog {
	id: string;
	userId: string;
	action: string;
	entityType: AuditEntityType;
	entityId: string | null;
	changes: Record<string, any> | null;
	createdAt: string;
	userEmail?: string;
	userName?: string;
}

interface AuditLogsFilters {
	entityType?: AuditEntityType;
	userId?: string;
}

export const auditLogsQueryKey = (filters: AuditLogsFilters = {}) =>
	["auditLogs", filters] as const;

/**
 * Custom hook to fetch audit logs with optional filters
 * Requires admin role
 */
export function useAuditLogsQuery(
	filters: AuditLogsFilters = {},
	enabled = true,
) {
	return useQuery({
		queryKey: auditLogsQueryKey(filters),
		queryFn: () =>
			api.get<{ logs: AuditLog[] }>("/api/admin/audit-logs", {
				params: filters as Record<string, string | undefined>,
			}),
		enabled,
	});
}
