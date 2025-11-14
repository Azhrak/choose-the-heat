import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

export const deleteTemplateMutationKey = (templateId: string) =>
	["deleteTemplate", templateId] as const;

/**
 * Custom hook to delete a template
 * Automatically invalidates related queries on success
 */
export function useDeleteTemplateMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteTemplateMutationKey(templateId),
		mutationFn: () => api.delete(`/api/admin/templates/${templateId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
