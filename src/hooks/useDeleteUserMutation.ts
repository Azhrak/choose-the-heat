import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersQueryKey } from "./useAdminUsersQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

export const deleteUserMutationKey = (userId: string) => ["deleteUser", userId] as const;

/**
 * Custom hook to delete a user
 * Automatically invalidates related queries on success
 */
export function useDeleteUserMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteUserMutationKey(userId),
		mutationFn: async () => {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete user");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
