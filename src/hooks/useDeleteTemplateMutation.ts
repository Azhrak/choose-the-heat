import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

export const deleteTemplateMutationKey = (templateId: string) => ["deleteTemplate", templateId] as const;

/**
 * Custom hook to delete a template
 * Automatically invalidates related queries on success
 */
export function useDeleteTemplateMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteTemplateMutationKey(templateId),
		mutationFn: async () => {
			const response = await fetch(`/api/admin/templates/${templateId}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete template");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
