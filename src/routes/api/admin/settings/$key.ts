import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	getSetting,
	resetSettingToDefault,
	updateSetting,
} from "~/lib/db/queries/settings";

// Validation schema for updating a single setting
const updateSettingSchema = z.object({
	value: z.string(),
});

export const Route = createFileRoute("/api/admin/settings/$key")({
	server: {
		handlers: {
			// GET /api/admin/settings/:key - Get a single setting
			GET: async ({ request, params }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					const { key } = params as unknown as { key: string };
					const setting = await getSetting(key);

					if (!setting) {
						return json({ error: "Setting not found" }, { status: 404 });
					}

					// Mask sensitive value
					const maskedSetting = {
						...setting,
						value: setting.is_sensitive ? "******" : setting.value,
					};

					return json({ setting: maskedSetting });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching setting:", error);
					return json({ error: "Failed to fetch setting" }, { status: 500 });
				}
			},

			// PUT /api/admin/settings/:key - Update a single setting
			PUT: async ({ request, params }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					const { key } = params as unknown as { key: string };
					const body = await request.json();
					const validatedData = updateSettingSchema.parse(body);

					await updateSetting(key, validatedData.value, user.userId);

					return json({ success: true });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation failed", details: error.issues },
							{ status: 400 },
						);
					}

					console.error("Error updating setting:", error);
					const message =
						error instanceof Error ? error.message : "Failed to update setting";
					return json({ error: message }, { status: 500 });
				}
			},

			// POST /api/admin/settings/:key/reset - Reset setting to default
			POST: async ({ request, params }) => {
				try {
					// Require admin role
					const user = await requireAdmin(request);

					const { key } = params as unknown as { key: string };
					await resetSettingToDefault(key, user.userId);

					return json({ success: true });
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}

					console.error("Error resetting setting:", error);
					const message =
						error instanceof Error ? error.message : "Failed to reset setting";
					return json({ error: message }, { status: 500 });
				}
			},
		},
	},
});
