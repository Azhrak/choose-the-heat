import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { userStoriesQueryKey } from "./useUserStoriesQuery";

interface BranchStoryData {
	sceneNumber: number;
	choicePointId: string;
	newChoice: number;
}

interface BranchStoryResult {
	success: boolean;
	storyId: string;
}

export const branchStoryMutationKey = (storyId: string) =>
	["branchStory", storyId] as const;

/**
 * Custom hook to branch a story from a specific scene
 * Automatically invalidates user stories queries on success
 */
export function useBranchStoryMutation(parentStoryId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: branchStoryMutationKey(parentStoryId),
		mutationFn: (data: BranchStoryData) =>
			api.post<BranchStoryResult>(`/api/stories/${parentStoryId}/branch`, data),
		onSuccess: () => {
			// Invalidate user stories queries to show the new branched story
			queryClient.invalidateQueries({
				queryKey: userStoriesQueryKey("in-progress"),
			});
			queryClient.invalidateQueries({
				queryKey: userStoriesQueryKey("completed"),
			});
		},
	});
}
