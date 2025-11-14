import { useQuery } from "@tanstack/react-query";
import type { UserPreferences } from "~/lib/types/preferences";

interface PreferencesResponse {
	preferences: UserPreferences;
}

export const userPreferencesQueryKey = ["preferences"] as const;

/**
 * Custom hook to fetch the current user's preferences
 */
export function useUserPreferencesQuery() {
	return useQuery({
		queryKey: userPreferencesQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/preferences", {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch preferences");
			return response.json() as Promise<PreferencesResponse>;
		},
	});
}
