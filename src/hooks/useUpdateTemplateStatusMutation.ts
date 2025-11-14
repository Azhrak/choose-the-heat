import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { TemplateStatus } from "~/lib/api/types";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";
import { adminTemplateQueryKey } from "./useAdminTemplateQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

export const updateTemplateStatusMutationKey = (templateId: string) =>
	["updateTemplateStatus", templateId] as const;

/**
 * Custom hook to update a template's status
 * Automatically invalidates related queries on success
 */
export function useUpdateTemplateStatusMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateTemplateStatusMutationKey(templateId),
		mutationFn: (status: TemplateStatus) =>
			api.patch(`/api/admin/templates/${templateId}/status`, { status }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminTemplateQueryKey(templateId),
			});
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
