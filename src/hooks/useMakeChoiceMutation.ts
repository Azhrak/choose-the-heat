import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { storySceneQueryKey } from "./useStorySceneQuery";

interface ChoiceData {
	choicePointId: string;
	selectedOption: number;
}

interface ChoiceResult {
	completed: boolean;
	nextScene?: number;
}

export const makeChoiceMutationKey = (storyId: string) =>
	["makeChoice", storyId] as const;

/**
 * Custom hook to record a user's choice in a story
 * Automatically invalidates related queries on success
 */
export function useMakeChoiceMutation(storyId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: makeChoiceMutationKey(storyId),
		mutationFn: (data: ChoiceData) =>
			api.post<ChoiceResult>(`/api/stories/${storyId}/choose`, data),
		onSuccess: () => {
			// Invalidate all queries for this story to get fresh data
			queryClient.invalidateQueries({
				queryKey: storySceneQueryKey(storyId, null).slice(0, 2),
			});
		},
	});
}
