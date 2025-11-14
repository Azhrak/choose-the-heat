import { useQuery } from "@tanstack/react-query";
import type { User } from "~/lib/api/types";

export const adminUsersQueryKey = ["adminUsers"] as const;

/**
 * Custom hook to fetch all users for admin management
 * Requires admin role
 */
export function useAdminUsersQuery(enabled = true) {
	return useQuery({
		queryKey: adminUsersQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/admin/users", {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}
			return response.json() as Promise<{ users: User[] }>;
		},
		enabled,
	});
}
