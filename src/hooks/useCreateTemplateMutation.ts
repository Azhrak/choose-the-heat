import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTemplatesQueryKey } from "./useAdminTemplatesQuery";
import { adminDashboardQueryKey } from "./useAdminDashboardQuery";

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
		mutationFn: async (data: TemplateFormData) => {
			const response = await fetch("/api/admin/templates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					title: data.title,
					description: data.description,
					base_tropes: data.base_tropes.split(",").map((t) => t.trim()),
					estimated_scenes: data.estimated_scenes,
					cover_gradient: data.cover_gradient,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create template");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminTemplatesQueryKey });
			queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey });
		},
	});
}
