import { useMutation } from "@tanstack/react-query";
import type { AIProvider } from "~/lib/ai/client";
import { api } from "~/lib/api/client";

interface TextGenerationParams {
	prompt: string;
	provider: AIProvider;
	model: string;
}

interface TextGenerationResult {
	text: string;
}

export const testTextGenerationMutationKey = ["testTextGeneration"] as const;

/**
 * Custom hook for admin test page text generation
 * Generates text using specified AI provider and model
 */
export function useTestTextGenerationMutation() {
	return useMutation({
		mutationKey: testTextGenerationMutationKey,
		mutationFn: async (params: TextGenerationParams) => {
			const response = await api.post<TextGenerationResult>(
				"/api/admin/test/generate-text",
				params,
			);
			return response.text;
		},
	});
}
