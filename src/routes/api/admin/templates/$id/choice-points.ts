import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import {
	getTemplateById,
	updateChoicePoints,
} from "~/lib/db/queries/templates";

// Validation schema for choice point options
const choiceOptionSchema = z.object({
	id: z.string(),
	text: z.string().min(1, "Option text is required"),
	tone: z.string().min(1, "Tone is required"),
	impact: z.string().min(1, "Impact is required"),
});

// Validation schema for choice points
const choicePointSchema = z.object({
	scene_number: z.number().int().min(1),
	prompt_text: z.string().min(1, "Prompt text is required"),
	options: z
		.array(choiceOptionSchema)
		.min(2, "At least 2 options are required")
		.max(4, "Maximum 4 options allowed"),
});

const updateChoicePointsSchema = z.object({
	choicePoints: z.array(choicePointSchema),
});

export const Route = createFileRoute("/api/admin/templates/$id/choice-points")({
	server: {
		handlers: {
			// PUT /api/admin/templates/:id/choice-points - Update choice points
			PUT: async ({ request, params }) => {
				try {
					// Require editor or admin role
					const user = await requireEditorOrAdmin(request);

					const templateId = params.id;

					// Check if template exists
					const template = await getTemplateById(templateId);
					if (!template) {
						return json({ error: "Template not found" }, { status: 404 });
					}

					const body = await request.json();
					const validatedData = updateChoicePointsSchema.parse(body);

					// Validate that choice points don't exceed max (scenes - 1)
					const maxChoicePoints = template.estimated_scenes - 1;
					if (validatedData.choicePoints.length > maxChoicePoints) {
						return json(
							{
								error: `Too many choice points. Maximum allowed is ${maxChoicePoints} (scenes - 1)`,
							},
							{ status: 400 },
						);
					}

					// Update choice points
					await updateChoicePoints(
						templateId,
						validatedData.choicePoints,
						user.userId,
					);

					return json({
						message: "Choice points updated successfully",
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation error", details: error.errors },
							{ status: 400 },
						);
					}

					console.error("Error updating choice points:", error);
					return json(
						{ error: "Failed to update choice points" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
