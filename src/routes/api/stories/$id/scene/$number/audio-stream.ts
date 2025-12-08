import { createFileRoute } from "@tanstack/react-router";
import { getSessionFromRequest } from "~/lib/auth/session";
import { saveSceneAudio } from "~/lib/db/queries/scene-audio";
import { getSceneByNumber } from "~/lib/db/queries/scenes";
import { getStoryById, updateStoryTTSSettings } from "~/lib/db/queries/stories";
import { getUserDefaultTTS } from "~/lib/db/queries/users";
import { generateSpeechStream } from "~/lib/tts/client";
import { getTTSConfig, getTTSConfigForStory } from "~/lib/tts/config";
import { uploadAudioToGCS } from "~/lib/tts/storage";

export const Route = createFileRoute(
	"/api/stories/$id/scene/$number/audio-stream",
)({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return new Response(JSON.stringify({ error: "Unauthorized" }), {
							status: 401,
							headers: { "Content-Type": "application/json" },
						});
					}

					const storyId = params.id;
					const sceneNumber = Number.parseInt(params.number, 10);

					if (Number.isNaN(sceneNumber)) {
						return new Response(
							JSON.stringify({ error: "Invalid scene number" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Verify story ownership
					const story = await getStoryById(storyId);
					if (!story || story.user_id !== session.userId) {
						return new Response(JSON.stringify({ error: "Story not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					// Get scene content
					const scene = await getSceneByNumber(storyId, sceneNumber);
					if (!scene || !scene.content) {
						return new Response(
							JSON.stringify({ error: "Scene not found or has no content" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					// Determine voice settings (query > story > user > default)
					const ttsConfig = await getTTSConfig();
					const storyTTS = await getTTSConfigForStory(
						story.tts_provider,
						story.tts_voice_id,
					);

					const provider = storyTTS.provider;
					let voiceId = storyTTS.voiceId;
					let voiceName: string | undefined;

					// If no story voice, try user default
					if (!voiceId) {
						const userDefault = await getUserDefaultTTS(session.userId);
						if (userDefault?.voiceId) {
							voiceId = userDefault.voiceId;
							voiceName = userDefault.voiceName;
						}
					}

					// If still no voice, use first available for provider
					if (!voiceId) {
						const availableVoices = ttsConfig.availableVoices[provider];
						if (availableVoices && availableVoices.length > 0) {
							voiceId = availableVoices[0].id;
							voiceName = availableVoices[0].name;
						} else {
							return new Response(
								JSON.stringify({
									error: "No voice available for TTS provider",
								}),
								{
									status: 500,
									headers: { "Content-Type": "application/json" },
								},
							);
						}
					}

					console.log(
						`[Audio Stream API] Streaming audio for story ${storyId}, scene ${sceneNumber}`,
					);
					console.log("[Audio Stream API] TTS Config:", {
						provider,
						voiceId,
						model: ttsConfig.model,
					});

					// Generate streaming speech
					const result = await generateSpeechStream({
						text: scene.content,
						provider,
						voiceId,
						config: ttsConfig,
					});

					// Create a readable stream
					// Also buffer chunks for saving to GCS after streaming
					const audioChunks: Buffer[] = [];
					let totalDuration = 0;

					const stream = new ReadableStream({
						async start(controller) {
							try {
								// Send metadata as the first chunk (JSON)
								// Include format information so client knows if it's MP3, PCM, etc.
								const metadataChunk = JSON.stringify({
									type: "metadata",
									metadata: {
										...result.metadata,
										provider, // Include provider info for client reference
										audioFormat: result.metadata.format, // 'mp3' for OpenAI, 'pcm' for Google
										// For PCM audio, include specs
										...(result.metadata.format === "pcm" && {
											pcmSpecs: {
												sampleRate: 24000,
												bitDepth: 16,
												channels: 1,
											},
										}),
									},
								});
								controller.enqueue(
									new TextEncoder().encode(`${metadataChunk}\n`),
								);

								totalDuration = result.metadata.estimatedDuration;

								// Stream audio chunks and buffer them for saving
								for await (const audioChunk of result.stream) {
									// Buffer for saving to GCS later
									audioChunks.push(audioChunk.chunk);

									const chunkData = JSON.stringify({
										type: "audio",
										index: audioChunk.index,
										isLast: audioChunk.isLast,
										data: audioChunk.chunk.toString("base64"),
										format: result.metadata.format,
									});
									controller.enqueue(
										new TextEncoder().encode(`${chunkData}\n`),
									);
								}

								controller.close();

								// After streaming completes, save to GCS in background
								// Don't await - let it happen asynchronously
								(async () => {
									try {
										console.log(
											`[Audio Stream API] Saving streamed audio to GCS for story ${storyId}, scene ${sceneNumber}`,
										);

										// Combine all chunks into single buffer
										const combinedBuffer = Buffer.concat(audioChunks);

										// Upload to GCS
										const audioUrl = await uploadAudioToGCS({
											audioBuffer: combinedBuffer,
											storyId,
											sceneNumber,
											provider,
											voiceId,
										});

										// Save metadata to database
										await saveSceneAudio({
											story_id: storyId,
											scene_number: sceneNumber,
											audio_url: audioUrl,
											file_size: combinedBuffer.length,
											duration: totalDuration.toString(),
											tts_provider: provider,
											voice_id: voiceId,
											voice_name: voiceName || voiceId,
										});

										// Update story TTS settings on first generation
										if (!story.tts_provider) {
											await updateStoryTTSSettings(storyId, {
												provider,
												voiceId,
												voiceName: voiceName || voiceId,
											});
										}

										console.log(
											`[Audio Stream API] Successfully saved streamed audio to GCS`,
										);
									} catch (error) {
										console.error(
											"[Audio Stream API] Error saving streamed audio:",
											error,
										);
										// Don't throw - stream already completed successfully
									}
								})();
							} catch (error) {
								console.error("Error in stream:", error);
								controller.error(error);
							}
						},
					});

					return new Response(stream, {
						headers: {
							"Content-Type": "application/x-ndjson",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					});
				} catch (error) {
					console.error("Error streaming audio:", error);
					return new Response(
						JSON.stringify({
							error: "Failed to stream audio",
							details: error instanceof Error ? error.message : String(error),
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
