import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { User } from "~/lib/api/types";

export const adminUserQueryKey = (userId: string) =>
	["adminUser", userId] as const;

/**
 * Custom hook to fetch a single user for admin editing
 * Requires admin role
 */
export function useAdminUserQuery(userId: string, enabled = true) {
	return useQuery({
		queryKey: adminUserQueryKey(userId),
		queryFn: () => api.get<{ user: User }>(`/api/admin/users/${userId}`),
		enabled,
	});
}
