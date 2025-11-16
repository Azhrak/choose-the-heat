import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

export const updateStoryTitleMutationKey = ["updateStoryTitle"];

interface UpdateStoryTitleData {
	storyId: string;
	storyTitle: string;
}

/**
 * Custom hook to update a story's title
 * Automatically invalidates related queries on success
 */
export function useUpdateStoryTitleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateStoryTitleMutationKey,
		mutationFn: async (data: UpdateStoryTitleData) => {
			return await api.patch<{ story: { id: string; story_title: string } }>(
				`/api/stories/${data.storyId}`,
				{
					storyTitle: data.storyTitle,
				},
			);
		},
		onSuccess: (_data, variables) => {
			// Invalidate the specific story query
			queryClient.invalidateQueries({ queryKey: ["story", variables.storyId] });
			// Invalidate user stories cache to refresh library
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
		},
	});
}
