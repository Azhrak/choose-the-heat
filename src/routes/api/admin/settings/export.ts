import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { getSettingsForExport } from "~/lib/db/queries/settings";

export const Route = createFileRoute("/api/admin/settings/export")({
	server: {
		handlers: {
			// GET /api/admin/settings/export - Export all settings as JSON
			GET: async ({ request }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					const url = new URL(request.url);
					const category = url.searchParams.get("category");

					const settings = await getSettingsForExport(
						category ? { category } : undefined,
					);

					// Get user email for metadata
					const userEmail = user.userId; // You may want to fetch actual email

					const exportData = {
						version: "1.0",
						exported_at: new Date().toISOString(),
						exported_by: userEmail,
						settings,
					};

					return json(exportData);
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error exporting settings:", error);
					return json({ error: "Failed to export settings" }, { status: 500 });
				}
			},
		},
	},
});
