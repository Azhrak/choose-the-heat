import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface ExistingStory {
	template_id: string;
	story_title: string;
}

export const existingStoriesQueryKey = ["existing-stories"] as const;

/**
 * Custom hook to fetch user's existing stories
 * Used to check for duplicates and calculate correct numbering when creating new stories
 */
export function useExistingStoriesQuery(enabled = true) {
	return useQuery({
		queryKey: existingStoriesQueryKey,
		queryFn: () =>
			api.get<{ stories: ExistingStory[] }>("/api/stories/user"),
		enabled,
	});
}
