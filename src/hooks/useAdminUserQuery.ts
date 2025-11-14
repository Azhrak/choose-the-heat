import { useQuery } from "@tanstack/react-query";
import type { User } from "~/lib/api/types";

export const adminUserQueryKey = (userId: string) => ["adminUser", userId] as const;

/**
 * Custom hook to fetch a single user for admin editing
 * Requires admin role
 */
export function useAdminUserQuery(userId: string, enabled = true) {
	return useQuery({
		queryKey: adminUserQueryKey(userId),
		queryFn: async () => {
			const response = await fetch(`/api/admin/users/${userId}`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("User not found");
				}
				throw new Error("Failed to fetch user");
			}
			return response.json() as Promise<{ user: User }>;
		},
		enabled,
	});
}
