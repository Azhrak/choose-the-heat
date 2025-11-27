import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	bulkUpdateSettings,
	getAllSettings,
	getSettingsByCategory,
} from "~/lib/db/queries/settings";

// Validation schema for bulk update
const bulkUpdateSchema = z.object({
	updates: z.array(
		z.object({
			key: z.string().min(1),
			value: z.string(),
		}),
	),
});

export const Route = createFileRoute("/api/admin/settings/")({
	server: {
		handlers: {
			// GET /api/admin/settings - Get all settings (optionally filtered by category)
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const url = new URL(request.url);
					const category = url.searchParams.get("category");

					let settings: Awaited<ReturnType<typeof getAllSettings>>;

					if (category) {
						settings = await getSettingsByCategory(category);
					} else {
						settings = await getAllSettings();
					}

					// Mask sensitive values
					const maskedSettings = settings.map((setting) => ({
						...setting,
						value: setting.is_sensitive ? "******" : setting.value,
					}));

					return json({ settings: maskedSettings });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching settings:", error);
					return json({ error: "Failed to fetch settings" }, { status: 500 });
				}
			},

			// PUT /api/admin/settings - Bulk update settings
			PUT: async ({ request }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					const body = await request.json();
					const validatedData = bulkUpdateSchema.parse(body);

					await bulkUpdateSettings(validatedData.updates, user.userId);

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

					console.error("Error updating settings:", error);
					return json({ error: "Failed to update settings" }, { status: 500 });
				}
			},
		},
	},
});
