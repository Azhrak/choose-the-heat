import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import {
	createTemplate,
	createTemplateWithChoicePoints,
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

// Validation schema for a single template
const templateSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().min(1, "Description is required"),
	base_tropes: z.array(z.string()).min(1, "At least one trope is required"),
	estimated_scenes: z.number().int().min(1).max(100),
	cover_gradient: z.string().min(1, "Cover gradient is required"),
	status: z.enum(["draft", "published", "archived"]).optional(),
	choice_points: z.array(choicePointSchema).optional(),
});

// Validation schema for bulk import request
const bulkImportSchema = z.object({
	templates: z
		.array(templateSchema)
		.min(1, "At least one template is required"),
});

export const Route = createFileRoute("/api/admin/templates/bulk-import")({
	server: {
		handlers: {
			// POST /api/admin/templates/bulk-import - Bulk import templates
			POST: async ({ request }) => {
				try {
					// Require editor or admin role
					const user = await requireEditorOrAdmin(request);

					const body = await request.json();
					const validatedData = bulkImportSchema.parse(body);

					const results = [];
					const errors = [];
					let totalChoicePoints = 0;

					// Process each template
					for (let i = 0; i < validatedData.templates.length; i++) {
						const templateData = validatedData.templates[i];
						const templateNum = i + 1;

						try {
							// Extract choice points from template data
							const { choice_points: choicePoints, ...template } = templateData;

							// Validate choice points if provided
							if (choicePoints && choicePoints.length > 0) {
								// Check that scene numbers are within range
								for (const cp of choicePoints) {
									if (cp.scene_number > template.estimated_scenes) {
										throw new Error(
											`Choice point at scene ${cp.scene_number} exceeds estimated scenes (${template.estimated_scenes})`,
										);
									}
								}

								// Check that choice points don't exceed max (scenes - 1)
								const maxChoicePoints = template.estimated_scenes - 1;
								if (choicePoints.length > maxChoicePoints) {
									throw new Error(
										`Too many choice points. Maximum allowed is ${maxChoicePoints} (scenes - 1)`,
									);
								}

								// Check for duplicate scene numbers
								const sceneNumbers = choicePoints.map((cp) => cp.scene_number);
								const uniqueSceneNumbers = new Set(sceneNumbers);
								if (sceneNumbers.length !== uniqueSceneNumbers.size) {
									throw new Error(
										"Duplicate scene numbers found in choice points",
									);
								}

								// Create template with choice points
								const newTemplate = await createTemplateWithChoicePoints(
									template,
									choicePoints,
									user.userId,
								);

								totalChoicePoints += choicePoints.length;

								results.push({
									template: newTemplate,
									choicePointsCount: choicePoints.length,
								});
							} else {
								// Create template without choice points
								const newTemplate = await createTemplate(template, user.userId);

								results.push({
									template: newTemplate,
									choicePointsCount: 0,
								});
							}
						} catch (error) {
							// Collect errors but continue processing other templates
							errors.push({
								templateNumber: templateNum,
								title: templateData.title,
								error:
									error instanceof Error
										? error.message
										: "Unknown error occurred",
							});
						}
					}

					// Return results
					if (results.length === 0) {
						return json(
							{
								error: "Failed to import any templates",
								details: errors,
							},
							{ status: 400 },
						);
					}

					return json(
						{
							message: "Bulk import completed",
							imported: results.length,
							failed: errors.length,
							totalChoicePoints,
							results,
							errors: errors.length > 0 ? errors : undefined,
						},
						{ status: 201 },
					);
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{
								error: "Validation error",
								details: error.issues,
							},
							{ status: 400 },
						);
					}

					console.error("Error during bulk import:", error);
					return json(
						{
							error:
								error instanceof Error
									? error.message
									: "Failed to import templates",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
