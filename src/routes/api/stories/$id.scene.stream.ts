import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getAIConfig, getAIConfigForStory } from "~/lib/ai/config";
import type { StoryPreferences } from "~/lib/ai/prompts";
import {
	buildScenePrompt,
	buildSystemPrompt,
	parseSceneMeta,
} from "~/lib/ai/prompts";
import { streamCompletion } from "~/lib/ai/streaming";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";
import {
	cacheScene,
	getCachedScene,
	getRecentScenes,
} from "~/lib/db/queries/scenes";
import {
	getChoicePointForScene,
	getStoryById,
	updateStoryAISettings,
} from "~/lib/db/queries/stories";

// Query params schema
const sceneQuerySchema = z.object({
	number: z.coerce.number().int().positive().optional(),
});

export const Route = createFileRoute("/api/stories/$id/scene/stream")({
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

					// Check if scene is cached
					const cachedScene = await getCachedScene(storyId, sceneNumber);

					if (cachedScene) {
						// Return cached scene immediately (non-streaming)
						const choicePoint = await getChoicePointForScene(
							story.template_id,
							sceneNumber,
						);

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

						// Return as Server-Sent Events format for consistency
						const encoder = new TextEncoder();
						const stream = new ReadableStream({
							start(controller) {
								// Send metadata event
								const metadata = {
									type: "metadata",
									scene: {
										number: sceneNumber,
										wordCount: cachedScene.word_count,
										cached: true,
									},
									story: {
										id: story.id,
										title:
											story.story_title || story.template?.title || "Untitled",
										currentScene: story.current_scene,
										estimatedScenes: story.template?.estimated_scenes || 10,
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
								};
								controller.enqueue(
									encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`),
								);

								// Send complete content at once
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "content", content: cachedScene.content })}\n\n`,
									),
								);

								// Send done event
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							},
						});

						return new Response(stream, {
							headers: {
								"Content-Type": "text/event-stream",
								"Cache-Control": "no-cache",
								Connection: "keep-alive",
							},
						});
					}

					// Scene not cached - stream generation
					// Get AI config for this story (with fallback to current settings)
					const aiConfig = await getAIConfigForStory(
						story.ai_provider,
						story.ai_model,
						story.ai_temperature,
					);

					// If this is the first scene and the story doesn't have AI settings saved yet,
					// save the current AI settings to the story
					if (sceneNumber === 1 && (!story.ai_provider || !story.ai_model)) {
						const currentConfig = await getAIConfig();
						await updateStoryAISettings(storyId, {
							provider: currentConfig.provider,
							model: currentConfig.model,
							temperature: currentConfig.temperature,
						});
						console.log(
							`[Scene Generation] Saved AI settings to story: ${currentConfig.provider} / ${currentConfig.model} / temp=${currentConfig.temperature}`,
						);
					}

					// Get context for generation
					const recentScenes = await getRecentScenes(storyId, 2);
					const previousSceneContents = recentScenes.map((s) => s.content);
					const previousMetadata = recentScenes
						.map((s) => s.metadata)
						.filter((m): m is NonNullable<typeof m> => m !== null);

					// Get last choice
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

					// Get choice point
					const choicePoint = await getChoicePointForScene(
						story.template_id,
						sceneNumber,
					);

					// Check for previous choice at this scene
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

					// Build prompts
					const preferences = story.preferences as unknown as StoryPreferences;
					const systemPrompt = await buildSystemPrompt(preferences);
					const userPrompt = buildScenePrompt({
						templateTitle: story.template.title,
						sceneNumber,
						previousScenes: previousSceneContents,
						previousMetadata,
						lastChoice: lastChoiceData,
						choicePoint: choicePoint
							? {
									sceneNumber: choicePoint.scene_number,
									promptText: choicePoint.prompt_text,
								}
							: undefined,
						estimatedScenes: story.template.estimated_scenes,
						sceneLength: preferences.sceneLength,
					});

					// Log the prompts being sent
					console.log("\n=== SYSTEM PROMPT ===");
					console.log(`${systemPrompt.substring(0, 500)}...`);
					console.log("\n=== USER PROMPT ===");
					console.log(userPrompt);
					console.log("=== END PROMPTS ===\n");

					// Get text stream (using story-specific config or current settings)
					const textStream = await streamCompletion(systemPrompt, userPrompt, {
						config: aiConfig,
					});

					// Create SSE stream
					const encoder = new TextEncoder();
					let fullContent = "";

					const stream = new ReadableStream({
						async start(controller) {
							try {
								// Send metadata first
								const metadata = {
									type: "metadata",
									scene: {
										number: sceneNumber,
										wordCount: 0, // Will be calculated when complete
										cached: false,
									},
									story: {
										id: story.id,
										title:
											story.story_title || story.template?.title || "Untitled",
										currentScene: story.current_scene,
										estimatedScenes: story.template?.estimated_scenes || 10,
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
								};
								controller.enqueue(
									encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`),
								);

								// Stream content chunks with metadata filtering
								// Keep a buffer to detect and strip <SCENE_META> blocks
								let buffer = "";
								const BUFFER_SIZE = 200; // Keep last 200 chars to detect opening tag

								for await (const chunk of textStream) {
									fullContent += chunk;
									buffer += chunk;

									// Check if we've accumulated enough content to safely stream
									// (avoiding streaming metadata tags)
									if (buffer.length > BUFFER_SIZE) {
										// Check if buffer contains the start of a metadata block
										const metaStartIndex = buffer.indexOf("<SCENE_META>");

										if (metaStartIndex !== -1) {
											// Found metadata block start - stream everything before it
											const contentToStream = buffer.substring(
												0,
												metaStartIndex,
											);
											if (contentToStream) {
												controller.enqueue(
													encoder.encode(
														`data: ${JSON.stringify({ type: "content", content: contentToStream })}\n\n`,
													),
												);
											}
											// Keep the metadata part in buffer for final processing
											buffer = buffer.substring(metaStartIndex);
										} else {
											// No metadata block detected, stream older content, keep recent buffer
											const contentToStream = buffer.substring(
												0,
												buffer.length - BUFFER_SIZE,
											);
											if (contentToStream) {
												controller.enqueue(
													encoder.encode(
														`data: ${JSON.stringify({ type: "content", content: contentToStream })}\n\n`,
													),
												);
											}
											buffer = buffer.substring(buffer.length - BUFFER_SIZE);
										}
									}
								}

								// Stream any remaining buffer content (excluding metadata)
								if (buffer) {
									// Remove any metadata block from the remaining buffer
									const metaRegex = /<SCENE_META>[\s\S]*?<\/SCENE_META>/i;
									const cleanBuffer = buffer.replace(metaRegex, "").trim();
									if (cleanBuffer) {
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({ type: "content", content: cleanBuffer })}\n\n`,
											),
										);
									}
								} // Parse and cache the complete content
								const parsed = parseSceneMeta(fullContent);
								await cacheScene(
									storyId,
									sceneNumber,
									parsed.content,
									parsed.metadata,
									parsed.summary,
								);

								// Send done event
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "done" })}\n\n`,
									),
								);
								controller.close();
							} catch (error) {
								console.error("Error streaming scene:", error);
								controller.enqueue(
									encoder.encode(
										`data: ${JSON.stringify({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
									),
								);
								controller.close();
							}
						},
					});

					return new Response(stream, {
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					});
				} catch (error) {
					console.error("Error in stream endpoint:", error);
					return json(
						{
							error: "Failed to stream scene",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
