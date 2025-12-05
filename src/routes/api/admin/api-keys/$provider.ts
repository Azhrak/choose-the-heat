import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { validateApiKey } from "~/lib/ai/validator";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	type APIKeyProvider,
	deleteApiKey,
	updateApiKey,
} from "~/lib/db/queries/apiKeys";
import { createAuditLog } from "~/lib/db/queries/audit";

// Validation schema for API key update
const updateApiKeySchema = z.object({
	apiKey: z.string().min(1, "API key is required"),
});

// Validation schema for provider parameter
const providerSchema = z.enum([
	"openai",
	"google",
	"anthropic",
	"mistral",
	"xai",
	"openrouter",
]);

export const Route = createFileRoute("/api/admin/api-keys/$provider")({
	server: {
		handlers: {
			// PUT /api/admin/api-keys/$provider - Update API key
			PUT: async ({ request, params }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					// Validate provider
					const provider = providerSchema.parse(params.provider);

					// Parse and validate request body
					const body = await request.json();
					const { apiKey } = updateApiKeySchema.parse(body);

					// Validate the API key before saving
					const validation = await validateApiKey(provider, apiKey.trim());

					if (!validation.valid) {
						await createAuditLog({
							userId: user.userId,
							action: "api_key_validation_failed",
							entityType: "setting",
							entityId: `api_key:${provider}`,
							changes: {
								provider,
								error: validation.error,
							},
						});

						return json(
							{
								error: validation.error || "API key validation failed",
							},
							{ status: 400 },
						);
					}

					// Save the encrypted API key with test status
					await updateApiKey(
						provider as APIKeyProvider,
						apiKey.trim(),
						user.userId,
						"valid",
						null,
					);

					// Log the successful update
					await createAuditLog({
						userId: user.userId,
						action: "api_key_updated",
						entityType: "setting",
						entityId: `api_key:${provider}`,
						changes: {
							provider,
							status: "valid",
						},
					});

					return json({ success: true });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation failed", details: error.errors },
							{ status: 400 },
						);
					}

					console.error("Error updating API key:", error);
					return json({ error: "Failed to update API key" }, { status: 500 });
				}
			},

			// DELETE /api/admin/api-keys/$provider - Delete API key
			DELETE: async ({ request, params }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					// Validate provider
					const provider = providerSchema.parse(params.provider);

					// Delete the API key
					await deleteApiKey(provider as APIKeyProvider);

					// Log the deletion
					await createAuditLog({
						userId: user.userId,
						action: "api_key_deleted",
						entityType: "setting",
						entityId: `api_key:${provider}`,
						changes: {
							provider,
						},
					});

					return json({ success: true });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Invalid provider", details: error.errors },
							{ status: 400 },
						);
					}

					console.error("Error deleting API key:", error);
					return json({ error: "Failed to delete API key" }, { status: 500 });
				}
			},
		},
	},
});
