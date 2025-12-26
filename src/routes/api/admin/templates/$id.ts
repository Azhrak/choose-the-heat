import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin, requireEditorOrAdmin } from "~/lib/auth/authorization";
import {
	deleteTemplate,
	getTemplateWithChoicePoints,
	updateTemplate,
} from "~/lib/db/queries/templates";

// Validation schema for updating a template
const updateTemplateSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	description: z.string().min(1).optional(),
	base_tropes: z.array(z.string()).min(1).optional(),
	estimated_scenes: z.number().int().min(1).max(100).optional(),
	cover_gradient: z.string().min(1).optional(),
});

// Validation schema for updating template status
const _updateStatusSchema = z.object({
	status: z.enum(["draft", "published", "archived"]),
});

export const Route = createFileRoute("/api/admin/templates/$id")({
	server: {
		handlers: {
			// GET /api/admin/templates/:id - Get single template with choice points
			GET: async ({ request, params }) => {
				try {
					await requireEditorOrAdmin(request);

					const templateData = await getTemplateWithChoicePoints(params.id);

					if (!templateData) {
						return json({ error: "Template not found" }, { status: 404 });
					}

					// Parse the JSON options field for each choice point
					const choicePoints = templateData.choicePoints?.map((cp) => ({
						...cp,
						options:
							typeof cp.options === "string"
								? JSON.parse(cp.options)
								: cp.options,
					}));

					return json({
						template: {
							...templateData,
							choicePoints,
						},
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					console.error("Error fetching template:", error);
					return json({ error: "Failed to fetch template" }, { status: 500 });
				}
			},

			// PATCH /api/admin/templates/:id - Update template
			PATCH: async ({ request, params }) => {
				try {
					const user = await requireEditorOrAdmin(request);

					const body = await request.json();
					const validatedData = updateTemplateSchema.parse(body);

					const updatedTemplate = await updateTemplate(
						params.id,
						validatedData,
						user.userId,
					);

					return json({
						template: updatedTemplate,
						message: "Template updated successfully",
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

					if ((error as Error).message === "Template not found") {
						return json({ error: "Template not found" }, { status: 404 });
					}

					console.error("Error updating template:", error);
					return json({ error: "Failed to update template" }, { status: 500 });
				}
			},

			// DELETE /api/admin/templates/:id - Delete template (admin only)
			DELETE: async ({ request, params }) => {
				try {
					const user = await requireAdmin(request);

					await deleteTemplate(params.id, user.userId);

					return json({ message: "Template deleted successfully" });
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					if ((error as Error).message === "Template not found") {
						return json({ error: "Template not found" }, { status: 404 });
					}

					console.error("Error deleting template:", error);
					return json({ error: "Failed to delete template" }, { status: 500 });
				}
			},
		},
	},
});
