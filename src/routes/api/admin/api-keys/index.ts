import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { listApiKeys } from "~/lib/db/queries/apiKeys";

export const Route = createFileRoute("/api/admin/api-keys/")({
	server: {
		handlers: {
			// GET /api/admin/api-keys - List all API keys metadata
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const keys = await listApiKeys();

					return json({ keys });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching API keys:", error);
					return json({ error: "Failed to fetch API keys" }, { status: 500 });
				}
			},
		},
	},
});
