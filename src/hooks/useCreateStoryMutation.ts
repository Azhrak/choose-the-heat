import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserPreferences } from "~/lib/types/preferences";
import { existingStoriesQueryKey } from "./useExistingStoriesQuery";

interface CreateStoryData {
	templateId: string;
	storyTitle?: string;
	preferences: UserPreferences;
}

export const createStoryMutationKey = ["createStory"] as const;

/**
 * Custom hook to create a new story
 * Automatically invalidates related queries on success
 */
export function useCreateStoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createStoryMutationKey,
		mutationFn: async (data: CreateStoryData) => {
			const response = await fetch("/api/stories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					templateId: data.templateId,
					storyTitle: data.storyTitle?.trim() || undefined,
					preferences: data.preferences,
				}),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create story");
			}
			return response.json() as Promise<{ story: { id: string } }>;
		},
		onSuccess: (_data, variables) => {
			// Invalidate user stories cache to refresh library
			queryClient.invalidateQueries({ queryKey: ["user-stories"] });
			// Invalidate existing stories cache
			queryClient.invalidateQueries({ queryKey: existingStoriesQueryKey });
		},
	});
}
