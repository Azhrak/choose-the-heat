import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";

export const adminTemplateQueryKey = (templateId: string) =>
	["adminTemplate", templateId] as const;

/**
 * Custom hook to fetch a single template for admin editing
 * Requires editor or admin role
 */
export function useAdminTemplateQuery(templateId: string, enabled = true) {
	return useQuery({
		queryKey: adminTemplateQueryKey(templateId),
		queryFn: () =>
			api.get<{ template: Template }>(`/api/admin/templates/${templateId}`),
		enabled,
	});
}
