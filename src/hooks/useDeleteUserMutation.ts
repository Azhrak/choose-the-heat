import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";
import { adminUsersQueryKey } from "./useAdminUsersQuery";

export const deleteUserMutationKey = (userId: string) =>
	["deleteUser", userId] as const;

/**
 * Custom hook to delete a user
 * Automatically invalidates related queries on success
 */
export function useDeleteUserMutation(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteUserMutationKey(userId),
		mutationFn: () => api.delete(`/api/admin/users/${userId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
