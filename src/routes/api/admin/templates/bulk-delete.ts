import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import { bulkDeleteTemplates } from "~/lib/db/queries/templates";

// Validation schema for bulk delete
const bulkDeleteSchema = z.object({
	templateIds: z
		.array(z.string().uuid())
		.min(1, "At least one template ID is required"),
});

export const Route = createFileRoute("/api/admin/templates/bulk-delete")({
	server: {
		handlers: {
			// POST /api/admin/templates/bulk-delete - Bulk delete templates (admin only)
			POST: async ({ request }) => {
				try {
					const user = await requireAdmin(request);

					const body = await request.json();
					const validatedData = bulkDeleteSchema.parse(body);

					const { templateIds } = validatedData;

					// Perform bulk delete
					const result = await bulkDeleteTemplates(templateIds, user.userId);

					return json({
						success: true,
						deletedCount: result.deletedCount,
						message: `Successfully deleted ${result.deletedCount} template${result.deletedCount !== 1 ? "s" : ""}`,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation error", details: error.issues },
							{ status: 400 },
						);
					}

					console.error("Error bulk deleting templates:", error);
					return json(
						{ error: "Failed to bulk delete templates" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
