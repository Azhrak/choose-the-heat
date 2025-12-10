import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import { bulkUpdateSettings } from "~/lib/db/queries/settings";
import {
	invalidateSettingsCache,
	getDefaultModelForProvider,
} from "~/lib/ai/config";
import {
	invalidateTTSCache,
	getDefaultModelForTTSProvider,
} from "~/lib/tts/config";
import type { AIProvider } from "~/lib/ai/client";
import type { TTSProvider } from "~/lib/tts/config";

const activateProviderSchema = z.object({
	provider: z.string(),
	category: z.enum(["text", "tts"]),
});

export const Route = createFileRoute("/api/admin/providers/activate")({
	server: {
		handlers: {
			// POST /api/admin/providers/activate
			// Activates a provider and sets its default model as the current model
			POST: async ({ request }) => {
				try {
					const user = await requireAdmin(request);
					const body = await request.json();
					const { provider, category } = activateProviderSchema.parse(body);

					const prefix = category === "text" ? "ai" : "tts";

					// Get default model for this provider
					const defaultModel =
						category === "text"
							? await getDefaultModelForProvider(provider as AIProvider)
							: await getDefaultModelForTTSProvider(provider as TTSProvider);

					// Update both provider and model
					await bulkUpdateSettings(
						[
							{ key: `${prefix}.provider`, value: provider },
							{ key: `${prefix}.model`, value: defaultModel },
						],
						user.userId,
					);

					// Invalidate cache
					if (category === "text") {
						invalidateSettingsCache();
					} else {
						invalidateTTSCache();
					}

					return json({ success: true, provider, model: defaultModel });
				} catch (error) {
					if (error instanceof Response) throw error;

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation failed", details: error.errors },
							{ status: 400 },
						);
					}

					console.error("Error activating provider:", error);
					return json(
						{ error: "Failed to activate provider" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
