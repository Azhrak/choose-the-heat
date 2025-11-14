import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "~/lib/db/types";
import { adminUserQueryKey } from "./useAdminUserQuery";
import { adminUsersQueryKey } from "./useAdminUsersQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

interface UserFormData {
	email: string;
	name: string;
	role: UserRole;
}

export const updateUserMutationKey = (userId: string) => ["updateUser", userId] as const;

/**
 * Custom hook to update a user's information
 * Automatically invalidates related queries on success
 */
export function useUpdateUserMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateUserMutationKey(userId),
		mutationFn: async (data: UserFormData) => {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update user");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminUserQueryKey(userId) });
			queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
