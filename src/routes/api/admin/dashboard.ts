import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import { getTemplateCountByStatus } from "~/lib/db/queries/templates";
import { getUserCountByRole } from "~/lib/db/queries/users";

interface DashboardStats {
	templates?: {
		total: number;
		draft: number;
		published: number;
		archived: number;
	};
	users?: {
		total: number;
		user: number;
		editor: number;
		admin: number;
	};
}

export const Route = createFileRoute("/api/admin/dashboard")({
	server: {
		handlers: {
			// GET /api/admin/dashboard - Get dashboard statistics
			GET: async ({ request }) => {
				try {
					const user = await requireEditorOrAdmin(request);

					const stats: DashboardStats = {};

					// Editors see template statistics
					if (user.role === "editor" || user.role === "admin") {
						const templateCounts = await getTemplateCountByStatus();
						stats.templates = {
							total:
								(templateCounts.draft || 0) +
								(templateCounts.published || 0) +
								(templateCounts.archived || 0),
							draft: templateCounts.draft || 0,
							published: templateCounts.published || 0,
							archived: templateCounts.archived || 0,
						};
					}

					// Admins also see user statistics
					if (user.role === "admin") {
						const userCounts = await getUserCountByRole();
						stats.users = {
							total:
								(userCounts.user || 0) +
								(userCounts.editor || 0) +
								(userCounts.admin || 0),
							user: userCounts.user || 0,
							editor: userCounts.editor || 0,
							admin: userCounts.admin || 0,
						};
					}

					return json({ stats });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching dashboard stats:", error);
					return json(
						{ error: "Failed to fetch dashboard statistics" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
