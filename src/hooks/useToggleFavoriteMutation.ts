import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface ToggleFavoriteData {
	storyId: string;
	isFavorite: boolean;
}

/**
 * Custom hook to toggle story favorite status
 */
export function useToggleFavoriteMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ storyId, isFavorite }: ToggleFavoriteData) => {
			return await api.put(`/api/stories/${storyId}/favorite`, {
				isFavorite,
			});
		},
		onSuccess: (_data, variables) => {
			// Invalidate both in-progress and completed story lists
			queryClient.invalidateQueries({
				queryKey: ["user-stories"],
			});
			// Invalidate individual story query
			queryClient.invalidateQueries({
				queryKey: ["story", variables.storyId],
			});
		},
	});
}
