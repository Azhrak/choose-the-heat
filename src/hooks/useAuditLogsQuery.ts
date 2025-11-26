import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { AuditEntityType } from "~/lib/db/types";

interface AuditLog {
	id: string;
	userId: string;
	action: string;
	entityType: AuditEntityType;
	entityId: string | null;
	changes: Record<string, unknown> | null;
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

/**
 * Custom hook to fetch paginated audit logs with optional filters
 * Requires admin role
 */
export function useAuditLogsPaginatedQuery(params: {
	page: number;
	limit: number;
	entityType?: AuditEntityType | "all";
	userId?: string;
	action?: string;
	enabled?: boolean;
}) {
	const { page, limit, entityType, userId, action, enabled = true } = params;

	return useQuery({
		queryKey: [
			"auditLogs",
			"paginated",
			page,
			limit,
			entityType || "all",
			userId || "",
			action || "",
		],
		queryFn: () => {
			const searchParams = new URLSearchParams({
				limit: limit.toString(),
				offset: ((page - 1) * limit).toString(),
			});

			if (entityType && entityType !== "all") {
				searchParams.set("entityType", entityType);
			}

			if (userId) {
				searchParams.set("userId", userId);
			}

			if (action) {
				searchParams.set("action", action);
			}

			return api.get<{
				logs: AuditLog[];
				pagination: {
					total: number;
					limit: number;
					offset: number;
					hasMore: boolean;
				};
			}>(`/api/admin/audit-logs?${searchParams.toString()}`);
		},
		enabled,
	});
}
