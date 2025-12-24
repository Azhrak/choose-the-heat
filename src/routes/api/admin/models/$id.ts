import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	deleteModel,
	getModelById,
	type ModelStatus,
	type UpdateModelData,
	updateModel,
	updateModelStatus,
} from "~/lib/db/queries/aiModels";

export const Route = createFileRoute("/api/admin/models/$id")({
	server: {
		handlers: {
			// GET /api/admin/models/:id
			GET: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					const model = await getModelById(params.id);

					if (!model) {
						return json({ error: "Model not found" }, { status: 404 });
					}

					return json({ model });
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error getting model:", error);
					return json({ error: "Failed to get model" }, { status: 500 });
				}
			},

			// PATCH /api/admin/models/:id
			// Body: { status?: 'enabled' | 'disabled' | 'deprecated', admin_notes?: string, ... }
			PATCH: async ({ request, params }) => {
				try {
					const user = await requireAdmin(request);

					const body = await request.json();
					const updates: UpdateModelData = {
						...body,
						updated_by: user.userId,
					};

					// If status is being updated, use updateModelStatus for proper timestamp handling
					if (updates.status) {
						const status = updates.status;
						delete updates.status; // Remove from updates to avoid duplication

						// Update other fields first
						if (Object.keys(updates).length > 1) {
							// has more than just updated_by
							await updateModel(params.id, updates);
						}

						// Then update status
						const model = await updateModelStatus(
							params.id,
							status as ModelStatus,
							user.userId,
						);

						return json({ model, message: "Model updated successfully" });
					}

					// Regular update without status change
					const model = await updateModel(params.id, updates);

					return json({ model, message: "Model updated successfully" });
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error updating model:", error);
					return json(
						{
							error: "Failed to update model",
							details: error instanceof Error ? error.message : String(error),
						},
						{ status: 500 },
					);
				}
			},

			// DELETE /api/admin/models/:id
			DELETE: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					await deleteModel(params.id);

					return json({ success: true, message: "Model deleted successfully" });
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error deleting model:", error);
					return json({ error: "Failed to delete model" }, { status: 500 });
				}
			},
		},
	},
});
