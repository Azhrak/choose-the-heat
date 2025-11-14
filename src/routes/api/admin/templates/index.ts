import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import {
	createTemplate,
	createTemplateWithChoicePoints,
	getAllTemplates,
	getTemplatesByStatus,
} from "~/lib/db/queries/templates";
import type { TemplateStatus } from "~/lib/db/types";

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

// Validation schema for creating a template
const createTemplateSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().min(1, "Description is required"),
	base_tropes: z.array(z.string()).min(1, "At least one trope is required"),
	estimated_scenes: z.number().int().min(1).max(100),
	cover_gradient: z.string().min(1, "Cover gradient is required"),
	status: z.enum(["draft", "published", "archived"]).optional(),
	choicePoints: z.array(choicePointSchema).optional(),
});

export const Route = createFileRoute("/api/admin/templates/")({
	server: {
		handlers: {
			// GET /api/admin/templates - Get all templates (including draft/archived)
			GET: async ({ request }) => {
				try {
					// Require editor or admin role
					await requireEditorOrAdmin(request);

					const url = new URL(request.url);
					const statusParam = url.searchParams.get(
						"status",
					) as TemplateStatus | null;

					let templates: Awaited<ReturnType<typeof getAllTemplates>>;

					if (statusParam) {
						templates = await getTemplatesByStatus(statusParam);
					} else {
						templates = await getAllTemplates();
					}

					return json({ templates });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching templates:", error);
					return json({ error: "Failed to fetch templates" }, { status: 500 });
				}
			},

			// POST /api/admin/templates - Create a new template
			POST: async ({ request }) => {
				try {
					// Require editor or admin role
					const user = await requireEditorOrAdmin(request);

					const body = await request.json();
					const validatedData = createTemplateSchema.parse(body);

					// Extract choice points from validated data
					const { choicePoints, ...templateData } = validatedData;

					// Validate choice points if provided
					if (choicePoints && choicePoints.length > 0) {
						// Check that choice points don't exceed max (scenes - 1)
						const maxChoicePoints = templateData.estimated_scenes - 1;
						if (choicePoints.length > maxChoicePoints) {
							return json(
								{
									error: `Too many choice points. Maximum allowed is ${maxChoicePoints} (scenes - 1)`,
								},
								{ status: 400 },
							);
						}

						// Create template with choice points
						const newTemplate = await createTemplateWithChoicePoints(
							templateData,
							choicePoints,
							user.userId,
						);

						return json(
							{
								template: newTemplate,
								message: "Template created successfully with choice points",
							},
							{ status: 201 },
						);
					}

					// Create template without choice points
					const newTemplate = await createTemplate(templateData, user.userId);

					return json(
						{
							template: newTemplate,
							message: "Template created successfully",
						},
						{ status: 201 },
					);
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

					console.error("Error creating template:", error);
					return json({ error: "Failed to create template" }, { status: 500 });
				}
			},
		},
	},
});
