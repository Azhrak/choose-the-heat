import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { invalidateSettingsCache } from "~/lib/ai/config";
import { requireAdmin } from "~/lib/auth/authorization";
import { updateSetting } from "~/lib/db/queries/settings";
import { invalidateTTSCache } from "~/lib/tts/config";

const activateProviderSchema = z.object({
	provider: z.string(),
	category: z.enum(["text", "tts"]),
});

export const Route = createFileRoute("/api/admin/providers/activate")({
	server: {
		handlers: {
			// POST /api/admin/providers/activate
			// Activates a provider (model is determined dynamically from database)
			POST: async ({ request }) => {
				try {
					const user = await requireAdmin(request);
					const body = await request.json();
					const { provider, category } = activateProviderSchema.parse(body);

					const prefix = category === "text" ? "ai" : "tts";

					// Only update the provider setting
					// The model will be determined dynamically from the database
					await updateSetting(`${prefix}.provider`, provider, user.userId);

					// Invalidate cache
					if (category === "text") {
						invalidateSettingsCache();
					} else {
						invalidateTTSCache();
					}

					return json({ success: true, provider });
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
