import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import {
	deleteUserStory,
	getStoryById,
	updateStoryTitle,
} from "~/lib/db/queries/stories";

const updateStorySchema = z.object({
	storyTitle: z.string().min(1).max(255),
});

export const Route = createFileRoute("/api/stories/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const storyId = params.id;

					// Get the story and verify ownership
					const story = await getStoryById(storyId);

					if (!story) {
						return json({ error: "Story not found" }, { status: 404 });
					}

					if (story.user_id !== session.userId) {
						return json({ error: "Forbidden" }, { status: 403 });
					}

					return json({ story });
				} catch (error) {
					console.error("Error fetching story:", error);
					return json(
						{
							error: "Failed to fetch story",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
			PATCH: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const storyId = params.id;
					const body = await request.json();
					const result = updateStorySchema.safeParse(body);

					if (!result.success) {
						return json(
							{ error: "Invalid request data", details: result.error.issues },
							{ status: 400 },
						);
					}

					const { storyTitle } = result.data;

					// Update the story title (ownership verification is done in the query)
					const updatedStory = await updateStoryTitle(
						storyId,
						session.userId,
						storyTitle,
					);

					return json({ story: updatedStory });
				} catch (error) {
					console.error("Error updating story:", error);
					return json(
						{
							error: "Failed to update story",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
			DELETE: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const storyId = params.id;

					// Delete the story (ownership verification is done in the query)
					const deleted = await deleteUserStory(storyId, session.userId);

					if (!deleted) {
						return json(
							{ error: "Story not found or already deleted" },
							{ status: 404 },
						);
					}

					return json({ success: true, message: "Story deleted successfully" });
				} catch (error) {
					console.error("Error deleting story:", error);
					return json(
						{
							error: "Failed to delete story",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
