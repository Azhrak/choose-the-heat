import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";

interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string;
	estimated_scenes: number;
	cover_gradient: string;
}

export const createTemplateMutationKey = ["createTemplate"] as const;

/**
 * Custom hook to create a new template
 * Automatically invalidates related queries on success
 */
export function useCreateTemplateMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createTemplateMutationKey,
		mutationFn: (data: TemplateFormData) =>
			api.post("/api/admin/templates", {
				title: data.title,
				description: data.description,
				base_tropes: data.base_tropes.split(",").map((t) => t.trim()),
				estimated_scenes: data.estimated_scenes,
				cover_gradient: data.cover_gradient,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
