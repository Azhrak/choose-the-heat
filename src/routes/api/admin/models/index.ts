import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	bulkUpdateModels,
	listModels,
	type ModelFilters,
	type ModelStatus,
	type UpdateModelData,
} from "~/lib/db/queries/aiModels";

export const Route = createFileRoute("/api/admin/models/")({
	server: {
		handlers: {
			// GET /api/admin/models?provider=openai&category=text&status=pending
			GET: async ({ request }) => {
				try {
					await requireAdmin(request);

					const url = new URL(request.url);
					const filters: ModelFilters = {};

					const provider = url.searchParams.get("provider");
					if (provider) filters.provider = provider;

					const category = url.searchParams.get("category");
					if (category) {
						if (category !== "text" && category !== "tts") {
							return json({ error: "Invalid category" }, { status: 400 });
						}
						filters.category = category as "text" | "tts";
					}

					const status = url.searchParams.get("status");
					if (status) {
						if (
							!["pending", "enabled", "disabled", "deprecated"].includes(status)
						) {
							return json({ error: "Invalid status" }, { status: 400 });
						}
						filters.status = status as ModelStatus;
					}

					const limit = url.searchParams.get("limit");
					if (limit) filters.limit = Number.parseInt(limit, 10);

					const offset = url.searchParams.get("offset");
					if (offset) filters.offset = Number.parseInt(offset, 10);

					const models = await listModels(filters);

					return json({ models, count: models.length });
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error listing models:", error);
					return json({ error: "Failed to list models" }, { status: 500 });
				}
			},

			// POST /api/admin/models/bulk-update
			// Body: { model_ids: string[], status: 'enabled' | 'disabled', admin_notes?: string }
			POST: async ({ request }) => {
				try {
					const user = await requireAdmin(request);

					const body = await request.json();
					const { model_ids, status, admin_notes } = body;

					if (
						!model_ids ||
						!Array.isArray(model_ids) ||
						model_ids.length === 0
					) {
						return json(
							{ error: "Missing or invalid model_ids" },
							{ status: 400 },
						);
					}

					if (
						!status ||
						!["enabled", "disabled", "deprecated"].includes(status)
					) {
						return json({ error: "Invalid status" }, { status: 400 });
					}

					const updates: UpdateModelData = {
						status: status as ModelStatus,
						updated_by: user.userId,
					};

					if (admin_notes) {
						updates.admin_notes = admin_notes;
					}

					const updatedCount = await bulkUpdateModels(model_ids, updates);

					return json({
						success: true,
						updatedCount,
						message: `Updated ${updatedCount} models to ${status}`,
					});
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error bulk updating models:", error);
					return json(
						{
							error: "Failed to bulk update models",
							details: error instanceof Error ? error.message : String(error),
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
