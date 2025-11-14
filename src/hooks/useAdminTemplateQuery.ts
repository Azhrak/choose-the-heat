import { useQuery } from "@tanstack/react-query";
import type { Template } from "~/lib/api/types";

export const adminTemplateQueryKey = (templateId: string) => ["adminTemplate", templateId] as const;

/**
 * Custom hook to fetch a single template for admin editing
 * Requires editor or admin role
 */
export function useAdminTemplateQuery(templateId: string, enabled = true) {
	return useQuery({
		queryKey: adminTemplateQueryKey(templateId),
		queryFn: async () => {
			const response = await fetch(`/api/admin/templates/${templateId}`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("Template not found");
				}
				throw new Error("Failed to fetch template");
			}
			return response.json() as Promise<{ template: Template }>;
		},
		enabled,
	});
}
