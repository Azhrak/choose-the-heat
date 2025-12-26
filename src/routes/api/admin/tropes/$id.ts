import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin, requireEditorOrAdmin } from "~/lib/auth/authorization";
import {
	deleteTrope,
	getTropeById,
	updateTrope,
} from "~/lib/db/queries/tropes";

// Validation schema for updating a trope
const updateTropeSchema = z.object({
	key: z
		.string()
		.min(1, "Key is required")
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Key must be lowercase letters, numbers, and hyphens only",
		)
		.optional(),
	label: z.string().min(1, "Label is required").max(255).optional(),
	description: z.string().optional(),
});

export const Route = createFileRoute("/api/admin/tropes/$id")({
	server: {
		handlers: {
			// GET /api/admin/tropes/:id - Get a specific trope
			GET: async ({ request, params }) => {
				try {
					// Require editor or admin role
					await requireEditorOrAdmin(request);

					const trope = await getTropeById(params.id);

					if (!trope) {
						return json({ error: "Trope not found" }, { status: 404 });
					}

					return json({ trope });
				} catch (error) {
					if (error instanceof Error) {
						return json({ error: error.message }, { status: 403 });
					}
					return json({ error: "Failed to fetch trope" }, { status: 500 });
				}
			},

			// PUT /api/admin/tropes/:id - Update a trope
			PUT: async ({ request, params }) => {
				try {
					// Require editor or admin role
					const user = await requireEditorOrAdmin(request);

					// Parse and validate request body
					const body = await request.json();
					const validationResult = updateTropeSchema.safeParse(body);

					if (!validationResult.success) {
						return json(
							{
								error: "Validation failed",
								details: validationResult.error.issues,
							},
							{ status: 400 },
						);
					}

					const data = validationResult.data;

					// Update the trope
					const trope = await updateTrope(params.id, data, user.userId);

					return json({
						success: true,
						trope,
					});
				} catch (error) {
					console.error("Error updating trope:", error);
					if (error instanceof Error) {
						return json({ error: error.message }, { status: 400 });
					}
					return json({ error: "Failed to update trope" }, { status: 500 });
				}
			},

			// DELETE /api/admin/tropes/:id - Delete a trope
			DELETE: async ({ request, params }) => {
				try {
					// Require admin role for deletion
					const user = await requireAdmin(request);

					// Delete the trope
					await deleteTrope(params.id, user.userId);

					return json({
						success: true,
						message: "Trope deleted successfully",
					});
				} catch (error) {
					console.error("Error deleting trope:", error);
					if (error instanceof Error) {
						return json({ error: error.message }, { status: 400 });
					}
					return json({ error: "Failed to delete trope" }, { status: 500 });
				}
			},
		},
	},
});
