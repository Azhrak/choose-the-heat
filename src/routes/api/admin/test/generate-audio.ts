import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { generateSpeech } from "~/lib/tts/client";
import type { TTSProvider } from "~/lib/tts/config";
import { generateSignedUrl, uploadAudioToGCS } from "~/lib/tts/storage";

export const Route = createFileRoute("/api/admin/test/generate-audio")({
	server: {
		handlers: {
			/**
			 * POST /api/admin/test/generate-audio
			 * Generate audio for testing purposes (admin only)
			 */
			POST: async ({ request }: { request: Request }) => {
				try {
					// 1. Auth check: admin only
					await requireAdmin(request);

					// 2. Parse request body
					const body = await request.json();
					const { text, provider, model, voiceId } = body as {
						text: string;
						provider: TTSProvider;
						model: string;
						voiceId: string;
					};

					// 3. Validate input
					if (!text || typeof text !== "string") {
						return json({ error: "Text is required" }, { status: 400 });
					}

					if (!provider || typeof provider !== "string") {
						return json({ error: "Provider is required" }, { status: 400 });
					}

					if (!model || typeof model !== "string") {
						return json({ error: "Model is required" }, { status: 400 });
					}

					if (!voiceId || typeof voiceId !== "string") {
						return json({ error: "Voice ID is required" }, { status: 400 });
					}

					// 4. Generate speech
					const result = await generateSpeech({
						text,
						provider,
						voiceId,
						config: {
							provider,
							model,
							gcsBucketName: "",
							gcsBucketPath: "",
							availableVoices: {
								openai: [],
								google: [],
								elevenlabs: [],
								azure: [],
							},
							availableModels: {
								openai: [model],
								google: [model],
								elevenlabs: [model],
								azure: [model],
							},
						},
					});

					// 5. Upload to GCS with test prefix
					const gcsPath = await uploadAudioToGCS({
						audioBuffer: result.audioBuffer,
						storyId: "test",
						sceneNumber: 0,
						provider,
						voiceId,
					});

					// 6. Generate signed URL
					const signedUrl = await generateSignedUrl(gcsPath);

					// 7. Return result
					return json({
						audioUrl: signedUrl,
						duration: result.duration,
						fileSize: result.audioBuffer.length,
						provider,
						model,
						voiceId,
					});
				} catch (error) {
					console.error("[Test Audio API] Error:", error);
					return json(
						{
							error:
								error instanceof Error
									? error.message
									: "Failed to generate audio",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
