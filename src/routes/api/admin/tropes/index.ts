import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireEditorOrAdmin } from "~/lib/auth/authorization";

import {
	createTrope,
	getAllTropes,
	getTropeUsageStats,
} from "~/lib/db/queries/tropes";

// Validation schema for creating a trope
const createTropeSchema = z.object({
	key: z
		.string()
		.min(1, "Key is required")
		.max(100)
		.regex(
			/^[a-z0-9-]+$/,
			"Key must be lowercase letters, numbers, and hyphens only",
		),
	label: z.string().min(1, "Label is required").max(255),
	description: z.string().optional(),
});

export const Route = createFileRoute("/api/admin/tropes/")({
	server: {
		handlers: {
			// GET /api/admin/tropes - Get all tropes
			GET: async ({ request }) => {
				try {
					// Require editor or admin role
					await requireEditorOrAdmin(request);

					const url = new URL(request.url);
					const withStats = url.searchParams.get("withStats") === "true";

					if (withStats) {
						const tropes = await getTropeUsageStats();
						return json({ tropes });
					}

					const tropes = await getAllTropes();
					return json({ tropes });
				} catch (error) {
					if (error instanceof Error) {
						return json({ error: error.message }, { status: 403 });
					}
					return json({ error: "Failed to fetch tropes" }, { status: 500 });
				}
			},

			// POST /api/admin/tropes - Create a new trope
			POST: async ({ request }) => {
				try {
					// Require editor or admin role
					const user = await requireEditorOrAdmin(request);

					// Parse and validate request body
					const body = await request.json();
					const validationResult = createTropeSchema.safeParse(body);

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

					// Create the trope
					const trope = await createTrope(
						{
							key: data.key,
							label: data.label,
							description: data.description,
						},
						user.userId,
					);

					return json(
						{
							success: true,
							trope,
						},
						{ status: 201 },
					);
				} catch (error) {
					console.error("Error creating trope:", error);
					if (error instanceof Error) {
						return json({ error: error.message }, { status: 400 });
					}
					return json({ error: "Failed to create trope" }, { status: 500 });
				}
			},
		},
	},
});
