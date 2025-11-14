import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminTemplateQueryKey } from "./useAdminTemplateQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string;
	estimated_scenes: number;
	cover_gradient: string;
}

export const updateTemplateMutationKey = (templateId: string) =>
	["updateTemplate", templateId] as const;

/**
 * Custom hook to update a template's information
 * Automatically invalidates related queries on success
 */
export function useUpdateTemplateMutation(templateId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateTemplateMutationKey(templateId),
		mutationFn: (data: TemplateFormData) =>
			api.patch(`/api/admin/templates/${templateId}`, {
				title: data.title,
				description: data.description,
				base_tropes: data.base_tropes.split(",").map((t) => t.trim()),
				estimated_scenes: data.estimated_scenes,
				cover_gradient: data.cover_gradient,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminTemplateQueryKey(templateId),
			});
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
		},
	});
}
