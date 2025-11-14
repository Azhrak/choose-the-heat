import { useQuery } from "@tanstack/react-query";

interface SceneData {
	scene: {
		number: number;
		content: string;
		wordCount: number;
		cached: boolean;
	};
	story: {
		id: string;
		title: string;
		currentScene: number;
		estimatedScenes: number;
		status: string;
	};
	choicePoint: {
		id: string;
		promptText: string;
		options: Array<{
			text: string;
			tone: string;
		}>;
	} | null;
}

export const storySceneQueryKey = (storyId: string, sceneNumber: number | null = null) => ["story-scene", storyId, sceneNumber] as const;

/**
 * Custom hook to fetch a scene from a story
 * @param storyId - The story ID
 * @param sceneNumber - Optional scene number (defaults to current scene)
 */
export function useStorySceneQuery(
	storyId: string,
	sceneNumber: number | null = null,
	enabled = true,
) {
	return useQuery<SceneData>({
		queryKey: storySceneQueryKey(storyId, sceneNumber),
		queryFn: async () => {
			const url =
				sceneNumber !== null
					? `/api/stories/${storyId}/scene?number=${sceneNumber}`
					: `/api/stories/${storyId}/scene`;
			const response = await fetch(url);
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to fetch scene");
			}
			return response.json();
		},
		enabled,
	});
}
