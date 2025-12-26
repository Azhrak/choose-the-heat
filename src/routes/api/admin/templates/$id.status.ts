import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import { updateTemplateStatus } from "~/lib/db/queries/templates";
import type { TemplateStatus } from "~/lib/db/types";

// Validation schema for updating template status
const updateStatusSchema = z.object({
	status: z.enum(["draft", "published", "archived"]),
});

export const Route = createFileRoute("/api/admin/templates/$id/status")({
	server: {
		handlers: {
			// PATCH /api/admin/templates/:id/status - Update template status
			PATCH: async ({ request, params }) => {
				try {
					const user = await requireEditorOrAdmin(request);

					const body = await request.json();
					const { status } = updateStatusSchema.parse(body);

					const updatedTemplate = await updateTemplateStatus(
						params.id,
						status as TemplateStatus,
						user.userId,
					);

					return json({
						template: updatedTemplate,
						message: `Template ${status} successfully`,
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

					console.error("Error updating template status:", error);
					return json(
						{ error: "Failed to update template status" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
