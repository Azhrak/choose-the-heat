import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storySceneQueryKey } from "./useStorySceneQuery";

interface ChoiceData {
	choicePointId: string;
	selectedOption: number;
}

interface ChoiceResult {
	completed: boolean;
	nextScene?: number;
}

export const makeChoiceMutationKey = (storyId: string) => ["makeChoice", storyId] as const;

/**
 * Custom hook to record a user's choice in a story
 * Automatically invalidates related queries on success
 */
export function useMakeChoiceMutation(storyId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: makeChoiceMutationKey(storyId),
		mutationFn: async (data: ChoiceData) => {
			const response = await fetch(`/api/stories/${storyId}/choose`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to record choice");
			}

			return response.json() as Promise<ChoiceResult>;
		},
		onSuccess: () => {
			// Invalidate all queries for this story to get fresh data
			queryClient.invalidateQueries({
				queryKey: storySceneQueryKey(storyId, null).slice(0, 2),
			});
		},
	});
}
