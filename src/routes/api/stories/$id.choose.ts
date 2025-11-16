import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import {
	getStoryById,
	recordChoice,
	updateStoryProgress,
} from "~/lib/db/queries/stories";

const choiceSchema = z.object({
	choicePointId: z.string().uuid(),
	selectedOption: z.number().int().min(0).max(2), // 0-2 for 3 options
	currentScene: z.number().int().positive(), // The scene number where the choice is being made
});

export const Route = createFileRoute("/api/stories/$id/choose")({
	server: {
		handlers: {
			POST: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const storyId = params.id;

					// Parse request body
					const body = await request.json();
					const parseResult = choiceSchema.safeParse(body);

					if (!parseResult.success) {
						return json(
							{
								error: "Invalid request data",
								details: parseResult.error.format(),
							},
							{ status: 400 },
						);
					}

					const { choicePointId, selectedOption, currentScene } =
						parseResult.data;

					// Get the story and verify ownership
					const story = await getStoryById(storyId);

					if (!story) {
						return json({ error: "Story not found" }, { status: 404 });
					}

					if (!story.template) {
						return json({ error: "Story template not found" }, { status: 500 });
					}

					if (story.user_id !== session.userId) {
						return json({ error: "Forbidden" }, { status: 403 });
					}

					// Record the choice
					await recordChoice(storyId, choicePointId, selectedOption);

					// Calculate next scene based on the current scene where the choice was made
					const nextScene = currentScene + 1;

					// Update story progress only if moving forward past current progress
					if (nextScene > story.current_scene) {
						await updateStoryProgress(storyId, nextScene, "in-progress");
					}

					return json({
						success: true,
						nextScene,
						completed: false,
					});
				} catch (error) {
					console.error("Error recording choice:", error);
					return json(
						{
							error: "Failed to record choice",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
