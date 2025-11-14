import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { StoryStatus, UserStory } from "~/lib/api/types";

interface UserStoriesResponse {
	stories: UserStory[];
}

export const userStoriesQueryKey = (status: StoryStatus) =>
	["user-stories", status] as const;

/**
 * Custom hook to fetch user's stories filtered by status
 * @param status - Filter stories by "in-progress" or "completed"
 */
export function useUserStoriesQuery(status: StoryStatus) {
	return useQuery({
		queryKey: userStoriesQueryKey(status),
		queryFn: async () => {
			return await api.get<UserStoriesResponse>("/api/stories/user", {
				params: { status },
			});
		},
	});
}
