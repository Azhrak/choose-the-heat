import { useQuery } from "@tanstack/react-query";
import type { UserStory, StoryStatus } from "~/lib/api/types";

interface UserStoriesResponse {
	stories: UserStory[];
}

export const userStoriesQueryKey = (status: StoryStatus) => ["user-stories", status] as const;

/**
 * Custom hook to fetch user's stories filtered by status
 * @param status - Filter stories by "in-progress" or "completed"
 */
export function useUserStoriesQuery(status: StoryStatus) {
	return useQuery({
		queryKey: userStoriesQueryKey(status),
		queryFn: async () => {
			const response = await fetch(`/api/stories/user?status=${status}`, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch stories");
			return response.json() as Promise<UserStoriesResponse>;
		},
	});
}
