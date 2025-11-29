import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface AudioMetadata {
	exists: boolean;
	audioUrl: string;
	fileSize: number;
	duration: number;
	provider: string;
	voice: {
		id: string;
		name: string;
	};
}

/**
 * Hook for managing audio generation for a scene
 */
export function useAudioGeneration(storyId: string, sceneNumber: number) {
	const queryClient = useQueryClient();
	const queryKey = ["scene-audio", storyId, sceneNumber];

	// Query to check if audio exists
	const audioQuery = useQuery({
		queryKey,
		queryFn: async (): Promise<AudioMetadata | null> => {
			try {
				const response = await api.get(
					`/api/stories/${storyId}/scene/${sceneNumber}/audio`,
				);
				return response as AudioMetadata;
			} catch (error) {
				console.error("Error fetching audio:", error);
				return null;
			}
		},
		enabled: !!storyId && sceneNumber > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Mutation for generating audio (same endpoint, just triggers generation)
	const generateMutation = useMutation({
		mutationFn: async (options?: { voice?: string }) => {
			const params = new URLSearchParams({ generate: "true" });
			if (options?.voice) {
				params.append("voice", options.voice);
			}
			const response = await api.get(
				`/api/stories/${storyId}/scene/${sceneNumber}/audio?${params.toString()}`,
			);
			return response as AudioMetadata;
		},
		onSuccess: () => {
			// Invalidate query to refetch
			queryClient.invalidateQueries({ queryKey });
		},
	});

	return {
		audio: audioQuery.data,
		isLoading: audioQuery.isLoading,
		isError: audioQuery.isError,
		generate: generateMutation.mutate,
		isGenerating: generateMutation.isPending,
	};
}
