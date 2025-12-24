import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	getModelByProviderId,
	type ModelCategory,
} from "~/lib/db/queries/aiModels";
import { upsertSetting } from "~/lib/db/queries/settings";

export const Route = createFileRoute("/api/admin/models/set-default")({
	server: {
		handlers: {
			// POST /api/admin/models/set-default
			// Body: { provider: string, category: 'text' | 'tts', model_id: string }
			POST: async ({ request }) => {
				try {
					const user = await requireAdmin(request);

					const body = await request.json();
					const { provider, category, model_id } = body;

					if (!provider || !category || !model_id) {
						return json({ error: "Missing required fields" }, { status: 400 });
					}

					if (category !== "text" && category !== "tts") {
						return json({ error: "Invalid category" }, { status: 400 });
					}

					// Verify the model exists and is enabled
					const model = await getModelByProviderId(
						provider,
						category as ModelCategory,
						model_id,
					);

					if (!model) {
						return json({ error: "Model not found" }, { status: 404 });
					}

					if (model.status !== "enabled") {
						return json(
							{ error: "Model must be enabled to set as default" },
							{ status: 400 },
						);
					}

					// Update app_settings with the default model
					const settingCategory = category === "text" ? "ai" : "tts";
					const settingKey = `${settingCategory}.${provider}.default_model`;

					await upsertSetting({
						key: settingKey,
						value: model_id,
						value_type: "string",
						category: settingCategory,
						description: `Default model for ${provider} ${category} generation`,
						updated_by: user.userId,
					});

					return json({
						success: true,
						message: `Set ${model_id} as default for ${provider}`,
						setting: {
							key: settingKey,
							value: model_id,
						},
					});
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error setting default model:", error);
					return json(
						{
							error: "Failed to set default model",
							details: error instanceof Error ? error.message : String(error),
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
