import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	getUserCountByRole,
	getUserVerifiedCount,
} from "~/lib/db/queries/users";

export const Route = createFileRoute("/api/admin/users/stats")({
	server: {
		handlers: {
			// GET /api/admin/users/stats - Get user statistics
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const [roleStats, verifiedCount] = await Promise.all([
						getUserCountByRole(),
						getUserVerifiedCount(),
					]);

					// Calculate total
					const total = Object.values(roleStats).reduce(
						(sum, count) => sum + count,
						0,
					);

					return json({
						total,
						user: roleStats.user || 0,
						editor: roleStats.editor || 0,
						admin: roleStats.admin || 0,
						verified: verifiedCount,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching user stats:", error);
					return json({ error: "Failed to fetch user stats" }, { status: 500 });
				}
			},
		},
	},
});
