import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	type GeneratedTemplate,
	type GenerateTemplateInput,
	generateTemplate,
} from "~/lib/ai/generateTemplate";
import { validateAndSanitizeTemplate } from "~/lib/ai/parseGeneratedTemplate";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";
import { getAllTropes } from "~/lib/db/queries/tropes";

// @ts-expect-error - Route will be registered after route tree regeneration
export const Route = createFileRoute("/api/admin/templates/generate")({
	server: {
		handlers: {
			/**
			 * POST /api/admin/templates/generate
			 * Generate a novel template using AI
			 */
			POST: async ({ request }: { request: Request }) => {
				try {
					// 1. Auth check: admin or editor only
					const user = await requireEditorOrAdmin(request);

					console.log(
						`[Template Generation API] Request from user ${user.userId} (${user.role})`,
					);

					// 2. Parse request body
					let input: GenerateTemplateInput;
					try {
						input = await request.json();
					} catch {
						return json(
							{ error: "Invalid JSON in request body" },
							{ status: 400 },
						);
					}

					// 3. Validate input
					if (
						!input.mode ||
						!["prompt", "trope-based", "random"].includes(input.mode)
					) {
						return json(
							{
								error:
									"Invalid mode. Must be 'prompt', 'trope-based', or 'random'",
							},
							{ status: 400 },
						);
					}

					if (input.mode === "prompt" && !input.prompt) {
						return json(
							{ error: "Prompt is required for 'prompt' mode" },
							{ status: 400 },
						);
					}

					if (
						input.mode === "trope-based" &&
						(!input.selectedTropes || input.selectedTropes.length === 0)
					) {
						return json(
							{
								error: "At least one trope is required for 'trope-based' mode",
							},
							{ status: 400 },
						);
					}

					// 4. Fetch available tropes and gradients for validation
					console.log("[Template Generation API] Fetching tropes...");
					const allTropes = await getAllTropes();
					const validGradients = GRADIENT_OPTIONS.map((g) => g.value);

					// 5. Generate template with AI
					console.log("[Template Generation API] Generating template...");
					let rawTemplate: GeneratedTemplate;
					try {
						rawTemplate = await generateTemplate(input, allTropes);
					} catch (error) {
						console.error(
							"[Template Generation API] AI generation failed:",
							error,
						);

						// Check if it's a provider error
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";

						if (
							errorMessage.includes("API") ||
							errorMessage.includes("connection") ||
							errorMessage.includes("network")
						) {
							return json(
								{
									error:
										"The AI service is temporarily unavailable. Please try again in a moment.",
									details: errorMessage,
								},
								{ status: 503 },
							);
						}

						// Other generation errors
						return json(
							{
								error: "Failed to generate template. Please try again.",
								details: errorMessage,
							},
							{ status: 500 },
						);
					}

					// 6. Validate and sanitize
					console.log("[Template Generation API] Validating template...");
					const validation = await validateAndSanitizeTemplate(
						rawTemplate,
						allTropes,
						validGradients,
					);

					if (!validation.valid) {
						console.error(
							"[Template Generation API] Validation failed:",
							validation.errors,
						);
						return json(
							{
								error:
									"The generated template has validation errors. Please try again.",
								details: validation.errors,
							},
							{ status: 500 },
						);
					}

					// 7. Return sanitized template with warnings
					console.log(
						"[Template Generation API] Template generated successfully",
					);
					console.log(
						`[Template Generation API] Warnings: ${validation.warnings.length}`,
					);

					return json({
						template: validation.sanitized,
						warnings: validation.warnings,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					console.error("[Template Generation API] Unexpected error:", error);

					return json(
						{
							error: "An unexpected error occurred. Please try again.",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
