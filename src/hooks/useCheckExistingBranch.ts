import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface ExistingBranch {
	id: string;
	story_title: string | null;
}

interface CheckBranchResponse {
	exists: boolean;
	branch: ExistingBranch | null;
}

export const checkExistingBranchQueryKey = (
	storyId: string,
	sceneNumber: number,
	choicePointId: string,
	choiceOption: number,
) =>
	[
		"checkExistingBranch",
		storyId,
		sceneNumber,
		choicePointId,
		choiceOption,
	] as const;

/**
 * Custom hook to check if a branch already exists with the same choice
 */
export function useCheckExistingBranch(
	storyId: string,
	sceneNumber: number,
	choicePointId: string,
	choiceOption: number,
	enabled = true,
) {
	return useQuery<CheckBranchResponse>({
		queryKey: checkExistingBranchQueryKey(
			storyId,
			sceneNumber,
			choicePointId,
			choiceOption,
		),
		queryFn: () =>
			api.get<CheckBranchResponse>(`/api/stories/${storyId}/branch`, {
				params: {
					sceneNumber,
					choicePointId,
					choiceOption,
				},
			}),
		enabled,
	});
}
