import { useQuery } from "@tanstack/react-query";
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

export const auditLogsQueryKey = (filters: AuditLogsFilters = {}) => ["auditLogs", filters] as const;

/**
 * Custom hook to fetch audit logs with optional filters
 * Requires admin role
 */
export function useAuditLogsQuery(filters: AuditLogsFilters = {}, enabled = true) {
	return useQuery({
		queryKey: auditLogsQueryKey(filters),
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters.entityType) {
				params.append("entityType", filters.entityType);
			}
			if (filters.userId) {
				params.append("userId", filters.userId);
			}

			const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch audit logs");
			}
			return response.json() as Promise<{ logs: AuditLog[] }>;
		},
		enabled,
	});
}
