import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest, getUserFromSession } from "~/lib/auth/session";
import {
	deleteSceneAudio,
	getSceneAudio,
	saveSceneAudio,
} from "~/lib/db/queries/scene-audio";
import { getSceneByNumber } from "~/lib/db/queries/scenes";
import { getStoryById, updateStoryTTSSettings } from "~/lib/db/queries/stories";
import { getUserDefaultTTS } from "~/lib/db/queries/users";
import { generateSpeech } from "~/lib/tts/client";
import { getTTSConfig, getTTSConfigForStory } from "~/lib/tts/config";
import {
	deleteAudioFromGCS,
	generateSignedUrl,
	uploadAudioToGCS,
} from "~/lib/tts/storage";

export const Route = createFileRoute("/api/stories/$id/scene/$number/audio")({
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
					const sceneNumber = Number.parseInt(params.number, 10);

					if (Number.isNaN(sceneNumber)) {
						return json({ error: "Invalid scene number" }, { status: 400 });
					}

					// Verify story ownership
					const story = await getStoryById(storyId);
					if (!story || story.user_id !== session.userId) {
						return json({ error: "Story not found" }, { status: 404 });
					}

					// Check URL parameter to see if we should generate audio
					const url = new URL(request.url);
					const shouldGenerate = url.searchParams.get("generate") === "true";

					// Check if audio already exists
					const existingAudio = await getSceneAudio(storyId, sceneNumber);

					if (existingAudio) {
						// Generate fresh signed URL from GCS path
						const signedUrl = await generateSignedUrl(existingAudio.audio_url);

						return json({
							exists: true,
							audioUrl: signedUrl,
							fileSize: existingAudio.file_size,
							duration: Number(existingAudio.duration),
							provider: existingAudio.tts_provider,
							voice: {
								id: existingAudio.voice_id,
								name: existingAudio.voice_name,
							},
						});
					}

					// Return "not found" if not generating
					if (!shouldGenerate) {
						return json({
							exists: false,
						});
					}

					// Generate new audio
					// Get scene content
					const scene = await getSceneByNumber(storyId, sceneNumber);
					if (!scene || !scene.content) {
						return json(
							{ error: "Scene not found or has no content" },
							{ status: 404 },
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
							return json(
								{ error: "No voice available for TTS provider" },
								{ status: 500 },
							);
						}
					}

					// Generate speech
					console.log(
						`[Audio API] Generating audio for story ${storyId}, scene ${sceneNumber}`,
					);
					console.log("[Audio API] TTS Config:", {
						provider,
						voiceId,
						model: ttsConfig.model,
					});

					const result = await generateSpeech({
						text: scene.content,
						provider,
						voiceId,
						config: ttsConfig,
					});

					// Upload to GCS
					const audioUrl = await uploadAudioToGCS({
						audioBuffer: result.audioBuffer,
						storyId,
						sceneNumber,
						provider,
						voiceId,
					});

					// Save metadata to database
					const savedAudio = await saveSceneAudio({
						story_id: storyId,
						scene_number: sceneNumber,
						audio_url: audioUrl,
						file_size: result.audioBuffer.length,
						duration: result.duration.toString(),
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

					// Generate fresh signed URL from GCS path
					const signedUrl = await generateSignedUrl(savedAudio.audio_url);

					return json({
						exists: true,
						audioUrl: signedUrl,
						fileSize: savedAudio.file_size,
						duration: Number(savedAudio.duration),
						provider: savedAudio.tts_provider,
						voice: {
							id: savedAudio.voice_id,
							name: savedAudio.voice_name,
						},
					});
				} catch (error) {
					console.error("Error generating audio:", error);
					return json(
						{
							error: "Failed to generate audio",
							details: error instanceof Error ? error.message : String(error),
						},
						{ status: 500 },
					);
				}
			},

			DELETE: async ({ request, params }) => {
				try {
					// Validate session (admin only for now)
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const user = await getUserFromSession(session);
					if (!user || user.role !== "admin") {
						return json({ error: "Forbidden" }, { status: 403 });
					}

					const storyId = params.id;
					const sceneNumber = Number.parseInt(params.number, 10);

					if (Number.isNaN(sceneNumber)) {
						return json({ error: "Invalid scene number" }, { status: 400 });
					}

					// Get audio metadata
					const audio = await getSceneAudio(storyId, sceneNumber);
					if (!audio) {
						return json({ error: "Audio not found" }, { status: 404 });
					}

					// Delete from GCS
					await deleteAudioFromGCS(audio.audio_url);

					// Delete from database
					await deleteSceneAudio(storyId, sceneNumber);

					return json({ success: true });
				} catch (error) {
					console.error("Error deleting audio:", error);
					return json({ error: "Failed to delete audio" }, { status: 500 });
				}
			},
		},
	},
});
