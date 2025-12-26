import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import { bulkUpdateTemplateStatus } from "~/lib/db/queries/templates";
import type { TemplateStatus } from "~/lib/db/types";

// Validation schema for bulk status update
const bulkUpdateSchema = z.object({
	templateIds: z
		.array(z.string().uuid())
		.min(1, "At least one template ID is required"),
	status: z.enum(["draft", "published", "archived"]),
});

export const Route = createFileRoute("/api/admin/templates/bulk-update")({
	server: {
		handlers: {
			// POST /api/admin/templates/bulk-update - Bulk update template status
			POST: async ({ request }) => {
				try {
					const user = await requireEditorOrAdmin(request);

					const body = await request.json();
					const validatedData = bulkUpdateSchema.parse(body);

					const { templateIds, status } = validatedData;

					// Perform bulk update
					const result = await bulkUpdateTemplateStatus(
						templateIds,
						status as TemplateStatus,
						user.userId,
					);

					return json({
						success: true,
						updatedCount: result.updatedCount,
						message: `Successfully updated ${result.updatedCount} template${result.updatedCount !== 1 ? "s" : ""} to ${status}`,
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

					console.error("Error bulk updating templates:", error);
					return json(
						{ error: "Failed to bulk update templates" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
