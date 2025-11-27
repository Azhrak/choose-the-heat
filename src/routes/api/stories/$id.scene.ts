import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { generateScene } from "~/lib/ai/generate";
import type { StoryPreferences } from "~/lib/ai/prompts";
import type { StoryStatus } from "~/lib/api/types";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";
import { getCachedScene } from "~/lib/db/queries/scenes";
import {
	getChoicePointForScene,
	getStoryById,
	updateStoryProgress,
} from "~/lib/db/queries/stories";

// Query params schema
const sceneQuerySchema = z.object({
	number: z.coerce.number().int().positive().optional(),
});

// Update progress schema
const updateProgressSchema = z.object({
	currentScene: z.number().int().positive(),
});

export const Route = createFileRoute("/api/stories/$id/scene")({
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

					// Parse query params
					const url = new URL(request.url);
					const queryParams = Object.fromEntries(url.searchParams);
					const parseResult = sceneQuerySchema.safeParse(queryParams);

					if (!parseResult.success) {
						return json(
							{
								error: "Invalid scene number",
								details: parseResult.error.format(),
							},
							{ status: 400 },
						);
					}

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

					// Determine which scene to fetch
					// If no query param, use scene 1 for completed stories, otherwise current_scene
					const defaultScene =
						story.status === "completed" ? 1 : story.current_scene;
					const sceneNumber = parseResult.data.number ?? defaultScene;

					// Check if scene number is valid
					if (sceneNumber < 1) {
						return json({ error: "Invalid scene number" }, { status: 400 });
					}

					if (sceneNumber > story.template.estimated_scenes) {
						return json(
							{ error: "Scene number exceeds story length" },
							{ status: 400 },
						);
					}

					// Try to get cached scene first
					let scene = await getCachedScene(storyId, sceneNumber);
					let cached = true;

					// If not cached, generate it
					if (!scene) {
						// Get the last choice made (if any)
						const lastChoice = await db
							.selectFrom("choices")
							.innerJoin(
								"choice_points",
								"choices.choice_point_id",
								"choice_points.id",
							)
							.select(["choice_points.options", "choices.selected_option"])
							.where("choices.story_id", "=", storyId)
							.orderBy("choices.created_at", "desc")
							.limit(1)
							.executeTakeFirst();

						// Extract choice details if present
						let lastChoiceData: { text: string; tone: string } | undefined;
						if (lastChoice) {
							const options = lastChoice.options as Array<{
								text: string;
								tone: string;
							}>;
							const selectedOption = options[lastChoice.selected_option];
							if (selectedOption) {
								lastChoiceData = {
									text: selectedOption.text,
									tone: selectedOption.tone,
								};
							}
						}

						// Generate the scene
						const result = await generateScene({
							storyId,
							templateId: story.template_id,
							templateTitle: story.template.title,
							sceneNumber,
							estimatedScenes: story.template.estimated_scenes,
							preferences: story.preferences as unknown as StoryPreferences,
							lastChoice: lastChoiceData,
							aiProvider: story.ai_provider,
							aiModel: story.ai_model,
							aiTemperature: story.ai_temperature,
						}); // Fetch the newly cached scene
						scene = await getCachedScene(storyId, sceneNumber);
						cached = result.cached;
					}

					if (!scene) {
						return json(
							{ error: "Failed to generate or fetch scene" },
							{ status: 500 },
						);
					}

					// Check if there's a choice point at this scene
					const choicePoint = await getChoicePointForScene(
						story.template_id,
						sceneNumber,
					);

					// Check if user has already made a choice at this scene (for re-reading)
					let previousChoice: number | null = null;
					if (choicePoint) {
						const existingChoice = await db
							.selectFrom("choices")
							.select("selected_option")
							.where("story_id", "=", storyId)
							.where("choice_point_id", "=", choicePoint.id)
							.executeTakeFirst();

						if (existingChoice) {
							previousChoice = existingChoice.selected_option;
						}
					}

					// Return scene data
					return json({
						scene: {
							number: sceneNumber,
							content: scene.content,
							wordCount: scene.word_count,
							cached,
						},
						story: {
							id: story.id,
							title: story.story_title || story.template.title,
							currentScene: story.current_scene,
							estimatedScenes: story.template.estimated_scenes,
							status: story.status,
						},
						choicePoint: choicePoint
							? {
									id: choicePoint.id,
									promptText: choicePoint.prompt_text,
									options: choicePoint.options as Array<{
										text: string;
										tone: string;
									}>,
								}
							: null,
						previousChoice,
					});
				} catch (error) {
					console.error("Error fetching scene:", error);
					return json(
						{
							error: "Failed to fetch scene",
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

					// Parse request body
					const body = await request.json();
					const parseResult = updateProgressSchema.safeParse(body);

					if (!parseResult.success) {
						return json(
							{
								error: "Invalid request data",
								details: parseResult.error.format(),
							},
							{ status: 400 },
						);
					}

					const { currentScene } = parseResult.data;

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

					// Only mark as complete if user is explicitly moving beyond the last scene
					// (via the "Mark as Completed" button)
					const isComplete = currentScene > story.template.estimated_scenes;
					const newStatus: StoryStatus = isComplete
						? "completed"
						: "in-progress";

					// Update story progress
					// Reset to scene 1 when completing so "Read Again" starts from the beginning
					const sceneToSave = isComplete ? 1 : currentScene;
					await updateStoryProgress(storyId, sceneToSave, newStatus);

					return json({
						success: true,
						currentScene,
						completed: isComplete,
					});
				} catch (error) {
					console.error("Error updating story progress:", error);
					return json(
						{
							error: "Failed to update progress",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
