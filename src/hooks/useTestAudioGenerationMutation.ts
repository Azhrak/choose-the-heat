import { useMutation } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { TTSProvider } from "~/lib/tts/config";

interface AudioGenerationParams {
	text: string;
	provider: TTSProvider;
	model: string;
	voiceId: string;
}

interface AudioGenerationResult {
	audioUrl: string;
}

export const testAudioGenerationMutationKey = ["testAudioGeneration"] as const;

/**
 * Custom hook for admin test page TTS audio generation
 * Generates audio using specified TTS provider, model, and voice
 */
export function useTestAudioGenerationMutation() {
	return useMutation({
		mutationKey: testAudioGenerationMutationKey,
		mutationFn: async (params: AudioGenerationParams) => {
			const response = await api.post<AudioGenerationResult>(
				"/api/admin/test/generate-audio",
				params,
			);
			return response.audioUrl;
		},
	});
}
