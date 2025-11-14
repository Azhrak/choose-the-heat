import { useQuery } from "@tanstack/react-query";
import type { Template } from "~/lib/api/types";

export const adminTemplatesQueryKey = ["adminTemplates"] as const;

/**
 * Custom hook to fetch all templates for admin management
 * Includes drafts and archived templates
 * Requires editor or admin role
 */
export function useAdminTemplatesQuery(enabled = true) {
	return useQuery({
		queryKey: adminTemplatesQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/admin/templates", {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch templates");
			}
			return response.json() as Promise<{ templates: Template[] }>;
		},
		enabled,
	});
}
