import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { User } from "~/lib/api/types";
import type { UserRole } from "~/lib/db/types";

export const adminUsersQueryKey = ["adminUsers"] as const;
export const adminUsersStatsQueryKey = ["adminUsers", "stats"] as const;

/**
 * Custom hook to fetch all users for admin management
 * Requires admin role
 */
export function useAdminUsersQuery(enabled = true) {
	return useQuery({
		queryKey: adminUsersQueryKey,
		queryFn: () => api.get<{ users: User[] }>("/api/admin/users"),
		enabled,
	});
}

/**
 * Custom hook to fetch paginated users for admin management
 * Requires admin role
 */
export function useAdminUsersPaginatedQuery(params: {
	page: number;
	limit: number;
	role?: UserRole | "all";
	enabled?: boolean;
}) {
	const { page, limit, role, enabled = true } = params;

	return useQuery({
		queryKey: [...adminUsersQueryKey, "paginated", page, limit, role || "all"],
		queryFn: () => {
			const searchParams = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (role && role !== "all") {
				searchParams.set("role", role);
			}

			return api.get<{
				users: User[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
				};
			}>(`/api/admin/users?${searchParams.toString()}`);
		},
		enabled,
	});
}

/**
 * Custom hook to fetch user statistics
 * Returns counts by role (total, user, editor, admin, verified)
 * Requires admin role
 */
export function useAdminUsersStatsQuery(enabled = true) {
	return useQuery({
		queryKey: adminUsersStatsQueryKey,
		queryFn: () =>
			api.get<{
				total: number;
				user: number;
				editor: number;
				admin: number;
				verified: number;
			}>("/api/admin/users/stats"),
		enabled,
	});
}
