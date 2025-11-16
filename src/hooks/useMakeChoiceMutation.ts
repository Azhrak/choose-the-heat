import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { storySceneQueryKey } from "./useStorySceneQuery";
import { userStoriesQueryKey } from "./useUserStoriesQuery";

interface ChoiceData {
	choicePointId: string;
	selectedOption: number;
	currentScene: number;
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
		onSuccess: (result) => {
			// Invalidate all queries for this story to get fresh data
			queryClient.invalidateQueries({
				queryKey: storySceneQueryKey(storyId, null).slice(0, 2),
			});

			// Invalidate single story query
			queryClient.invalidateQueries({
				queryKey: ["story", storyId],
			});

			// If story is completed, invalidate user stories to update library status
			if (result.completed) {
				queryClient.invalidateQueries({
					queryKey: userStoriesQueryKey("in-progress"),
				});
				queryClient.invalidateQueries({
					queryKey: userStoriesQueryKey("completed"),
				});
			}
		},
	});
}
