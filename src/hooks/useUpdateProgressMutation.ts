import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userStoriesQueryKey } from "~/hooks/useUserStoriesQuery";
import { api } from "~/lib/api/client";
import { storySceneQueryKey } from "./useStorySceneQuery";

interface UpdateProgressData {
	currentScene: number;
}

interface UpdateProgressResult {
	success: boolean;
	currentScene: number;
	completed: boolean;
}

export const updateProgressMutationKey = (storyId: string) =>
	["updateProgress", storyId] as const;

/**
 * Custom hook to update story progress
 * Automatically invalidates related queries on success
 */
export function useUpdateProgressMutation(storyId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateProgressMutationKey(storyId),
		mutationFn: (data: UpdateProgressData) =>
			api.patch<UpdateProgressResult>(`/api/stories/${storyId}/scene`, data),
		onSuccess: (result) => {
			// Invalidate all queries for this story to get fresh data
			queryClient.invalidateQueries({
				queryKey: storySceneQueryKey(storyId, null).slice(0, 2),
			});

			// Invalidate single story query
			queryClient.invalidateQueries({
				queryKey: ["story", storyId],
			});

			// If story is completed, invalidate all user stories queries to update library
			if (result.completed) {
				queryClient.invalidateQueries({
					queryKey: userStoriesQueryKey(),
				});
			}
		},
	});
}
