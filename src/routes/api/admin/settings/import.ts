import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import { importSettings } from "~/lib/db/queries/settings";

// Validation schema for import data
const importSchema = z.object({
	version: z.string().optional(),
	exported_at: z.string().optional(),
	exported_by: z.string().optional(),
	settings: z.record(z.string(), z.string()),
});

export const Route = createFileRoute("/api/admin/settings/import")({
	server: {
		handlers: {
			// POST /api/admin/settings/import - Import settings from JSON
			POST: async ({ request }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					const body = await request.json();
					const validatedData = importSchema.parse(body);

					const result = await importSettings(
						validatedData.settings,
						user.userId,
					);

					return json({
						success: true,
						updated: result.updated,
						skipped: result.skipped,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Invalid import data format", details: error.errors },
							{ status: 400 },
						);
					}

					console.error("Error importing settings:", error);
					const message =
						error instanceof Error
							? error.message
							: "Failed to import settings";
					return json({ error: message }, { status: 500 });
				}
			},
		},
	},
});
