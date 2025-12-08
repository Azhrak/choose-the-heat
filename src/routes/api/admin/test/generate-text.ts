import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { AIProvider } from "~/lib/ai/client";
import { generateCompletion } from "~/lib/ai/client";
import type { AIConfig } from "~/lib/ai/config";
import { requireAdmin } from "~/lib/auth/authorization";

export const Route = createFileRoute("/api/admin/test/generate-text")({
	server: {
		handlers: {
			/**
			 * POST /api/admin/test/generate-text
			 * Generate text for testing purposes (admin only)
			 */
			POST: async ({ request }: { request: Request }) => {
				try {
					// 1. Auth check: admin only
					await requireAdmin(request);

					// 2. Parse request body
					const body = await request.json();
					const { prompt, provider, model } = body as {
						prompt: string;
						provider: AIProvider;
						model: string;
					};

					// 3. Validate input
					if (!prompt || typeof prompt !== "string") {
						return json({ error: "Prompt is required" }, { status: 400 });
					}

					if (!provider || typeof provider !== "string") {
						return json({ error: "Provider is required" }, { status: 400 });
					}

					if (!model || typeof model !== "string") {
						return json({ error: "Model is required" }, { status: 400 });
					}

					// 4. Create custom config for this test
					const testConfig: AIConfig = {
						provider,
						model,
						temperature: 0.7,
						maxTokens: 300, // Limit for test (under 200 words)
						fallbackEnabled: false,
						timeoutSeconds: 60,
						availableModels: {
							openai: [model],
							google: [model],
							anthropic: [model],
							mistral: [model],
							xai: [model],
							openrouter: [model],
						},
					};

					// 5. Generate text
					const text = await generateCompletion(
						"You are a creative romance writer. Generate engaging, emotional content.",
						prompt,
						{
							model,
							temperature: 0.7,
							maxTokens: 300,
							config: testConfig,
						},
					);

					// 6. Return result
					return json({ text });
				} catch (error) {
					console.error("[Test Generation API] Error:", error);
					return json(
						{
							error:
								error instanceof Error
									? error.message
									: "Failed to generate text",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
