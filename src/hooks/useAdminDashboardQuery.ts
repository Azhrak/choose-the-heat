import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
	templates?: {
		total: number;
		draft: number;
		published: number;
		archived: number;
	};
	users?: {
		total: number;
		user: number;
		editor: number;
		admin: number;
	};
}

export const adminDashboardQueryKey = ["adminDashboard"] as const;

/**
 * Custom hook to fetch admin dashboard statistics
 * Requires admin or editor role
 */
export function useAdminDashboardQuery(enabled = true) {
	return useQuery({
		queryKey: adminDashboardQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/admin/dashboard", {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch dashboard statistics");
			}
			return response.json() as Promise<{ stats: DashboardStats }>;
		},
		enabled,
	});
}
