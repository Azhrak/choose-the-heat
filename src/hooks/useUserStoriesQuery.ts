import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { StoryStatus, UserStory } from "~/lib/api/types";

interface UserStoriesResponse {
	stories: UserStory[];
}

export const userStoriesQueryKey = (
	status: StoryStatus,
	favoritesOnly?: boolean,
) => ["user-stories", status, favoritesOnly] as const;

/**
 * Custom hook to fetch user's stories filtered by status and optionally favorites
 * @param status - Filter stories by "in-progress" or "completed"
 * @param favoritesOnly - Filter to show only favorite stories
 */
export function useUserStoriesQuery(
	status: StoryStatus,
	favoritesOnly?: boolean,
) {
	return useQuery({
		queryKey: userStoriesQueryKey(status, favoritesOnly),
		queryFn: async () => {
			const params: Record<string, string> = { status };
			if (favoritesOnly) {
				params.favorites = "true";
			}
			return await api.get<UserStoriesResponse>("/api/stories/user", {
				params,
			});
		},
	});
}
