import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { validateApiKey } from "~/lib/ai/validator";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	type APIKeyProvider,
	getApiKey,
	updateApiKeyTestStatus,
} from "~/lib/db/queries/apiKeys";
import { createAuditLog } from "~/lib/db/queries/audit";

// Validation schema for provider parameter
const providerSchema = z.enum([
	"openai",
	"google",
	"anthropic",
	"mistral",
	"xai",
	"openrouter",
]);

export const Route = createFileRoute("/api/admin/api-keys/$provider/test")({
	server: {
		handlers: {
			// POST /api/admin/api-keys/$provider/test - Test API key
			POST: async ({ request, params }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					// Validate provider
					const provider = providerSchema.parse(params.provider);

					// Get the stored API key
					const apiKey = await getApiKey(provider as APIKeyProvider);

					if (!apiKey) {
						return json(
							{ error: `No API key configured for ${provider}` },
							{ status: 404 },
						);
					}

					// Validate the API key
					const validation = await validateApiKey(
						provider as APIKeyProvider,
						apiKey,
					);

					// Update the test status
					await updateApiKeyTestStatus(
						provider as APIKeyProvider,
						validation.valid ? "valid" : "invalid",
						validation.error,
					);

					// Log the test attempt
					await createAuditLog({
						userId: user.userId,
						action: "api_key_tested",
						entityType: "setting",
						entityId: `api_key:${provider}`,
						changes: {
							provider,
							valid: validation.valid,
							error: validation.error,
						},
					});

					if (validation.valid) {
						return json({
							valid: true,
							message: "API key is valid and working",
						});
					}

					return json({
						valid: false,
						error: validation.error || "API key validation failed",
					});
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

					console.error("Error testing API key:", error);
					return json({ error: "Failed to test API key" }, { status: 500 });
				}
			},
		},
	},
});
