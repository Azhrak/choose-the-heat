import { useQuery } from "@tanstack/react-query";

interface ExistingStory {
	template_id: string;
	story_title: string;
}

export const existingStoriesQueryKey = ["existing-stories"] as const;

/**
 * Custom hook to fetch user's existing in-progress stories
 * Used to check for duplicates when creating new stories
 */
export function useExistingStoriesQuery(enabled = true) {
	return useQuery({
		queryKey: existingStoriesQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/stories/user?status=in-progress", {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch stories");
			return response.json() as Promise<{ stories: ExistingStory[] }>;
		},
		enabled,
	});
}
