import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import { toggleStoryFavorite } from "~/lib/db/queries/stories";

const toggleFavoriteSchema = z.object({
	isFavorite: z.boolean(),
});

export const Route = createFileRoute("/api/stories/$id/favorite")({
	server: {
		handlers: {
			PUT: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const storyId = params.id;

					// Parse request body
					const body = await request.json();
					const result = toggleFavoriteSchema.safeParse(body);

					if (!result.success) {
						return json(
							{ error: "Invalid request data", details: result.error.issues },
							{ status: 400 },
						);
					}

					const { isFavorite } = result.data;

					// Toggle favorite status
					const updatedStory = await toggleStoryFavorite(
						storyId,
						session.userId,
						isFavorite,
					);

					return json({ story: updatedStory });
				} catch (error) {
					console.error("Error toggling favorite:", error);

					if (
						error instanceof Error &&
						error.message.includes("not found or access denied")
					) {
						return json({ error: "Story not found" }, { status: 404 });
					}

					return json({ error: "Failed to toggle favorite" }, { status: 500 });
				}
			},
		},
	},
});
