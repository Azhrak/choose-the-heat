import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { UserStory } from "~/lib/api/types";

interface StoryResponse {
	story: UserStory;
}

export function useStoryQuery(storyId: string) {
	return useQuery({
		queryKey: ["story", storyId],
		queryFn: async () => {
			return await api.get<StoryResponse>(`/api/stories/${storyId}`);
		},
	});
}
