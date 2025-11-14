import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { api } from "~/lib/api/client";
import { adminTemplateQueryKey } from "./useAdminTemplateQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

interface UpdateChoicePointsData {
	choicePoints: ChoicePoint[];
}

export const updateChoicePointsMutationKey = (templateId: string) =>
	["updateChoicePoints", templateId] as const;

/**
 * Custom hook to update choice points for a template
 * Automatically invalidates related queries on success
 */
export function useUpdateChoicePointsMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateChoicePointsMutationKey(templateId),
		mutationFn: (data: UpdateChoicePointsData) =>
			api.put<{ message: string }>(
				`/api/admin/templates/${templateId}/choice-points`,
				data,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminTemplateQueryKey(templateId),
			});
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
		},
	});
}
