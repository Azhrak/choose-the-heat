import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { currentUserQueryKey } from "./useCurrentUserQuery";
import { profileQueryKey } from "./useProfileQuery";

export const updateProfileMutationKey = ["updateProfile"] as const;

interface UpdateProfileData {
	name: string;
	email: string;
}

/**
 * Custom hook to update user profile information
 * Automatically invalidates profile and currentUser queries on success
 */
export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateProfileMutationKey,
		mutationFn: async (data: UpdateProfileData) => {
			return await api.patch<UpdateProfileData>("/api/profile", data);
		},
		onSuccess: () => {
			// Invalidate profile and currentUser queries to refetch latest data
			queryClient.invalidateQueries({ queryKey: profileQueryKey });
			queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
		},
	});
}
