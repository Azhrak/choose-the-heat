import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { getAuditLogCount, getAuditLogs } from "~/lib/db/queries/audit";
import type { AuditEntityType } from "~/lib/db/types";

export const Route = createFileRoute("/api/admin/audit-logs")({
	server: {
		handlers: {
			// GET /api/admin/audit-logs - Get audit logs with filters and pagination
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const url = new URL(request.url);
					const entityTypeParam = url.searchParams.get(
						"entityType",
					) as AuditEntityType | null;
					const entityIdParam = url.searchParams.get("entityId");
					const userIdParam = url.searchParams.get("userId");
					const actionParam = url.searchParams.get("action");
					const limitParam = url.searchParams.get("limit");
					const offsetParam = url.searchParams.get("offset");

					const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
					const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

					const filters = {
						entityType: entityTypeParam || undefined,
						entityId: entityIdParam || undefined,
						userId: userIdParam || undefined,
						action: actionParam || undefined,
						limit,
						offset,
					};

					const [logs, totalCount] = await Promise.all([
						getAuditLogs(filters),
						getAuditLogCount({
							entityType: filters.entityType,
							entityId: filters.entityId,
							userId: filters.userId,
							action: filters.action,
						}),
					]);

					return json({
						logs,
						pagination: {
							total: totalCount,
							limit,
							offset,
							hasMore: offset + limit < totalCount,
						},
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching audit logs:", error);
					return json({ error: "Failed to fetch audit logs" }, { status: 500 });
				}
			},
		},
	},
});
