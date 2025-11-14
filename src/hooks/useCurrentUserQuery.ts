import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "~/lib/db/types";

export interface CurrentUser {
	id: string;
	role: UserRole;
}

export const currentUserQueryKey = ["currentUser"] as const;

/**
 * Custom hook to fetch the current user's profile data
 * Returns null if the user is not authenticated
 */
export function useCurrentUserQuery() {
	return useQuery({
		queryKey: currentUserQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/profile", {
				credentials: "include",
			});
			if (!response.ok) return null;
			return response.json() as Promise<CurrentUser>;
		},
	});
}
