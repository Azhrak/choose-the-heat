import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateStatus } from "~/lib/api/types";
import { adminTemplateQueryKey } from "./useAdminTemplateQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

export const updateTemplateStatusMutationKey = (templateId: string) => ["updateTemplateStatus", templateId] as const;

/**
 * Custom hook to update a template's status
 * Automatically invalidates related queries on success
 */
export function useUpdateTemplateStatusMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateTemplateStatusMutationKey(templateId),
		mutationFn: async (status: TemplateStatus) => {
			const response = await fetch(`/api/admin/templates/${templateId}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ status }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update status");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplateQueryKey(templateId) });
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
