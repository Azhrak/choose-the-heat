import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";
import type { TemplateStatus } from "~/lib/db/types";

export const adminTemplatesQueryKey = ["adminTemplates"] as const;
export const adminTemplatesStatsQueryKey = ["adminTemplates", "stats"] as const;

/**
 * Custom hook to fetch all templates for admin management
 * Includes drafts and archived templates
 * Requires editor or admin role
 */
export function useAdminTemplatesQuery(enabled = true) {
	return useQuery({
		queryKey: adminTemplatesQueryKey,
		queryFn: () => api.get<{ templates: Template[] }>("/api/admin/templates"),
		enabled,
	});
}

/**
 * Custom hook to fetch paginated templates for admin management
 * Includes drafts and archived templates
 * Requires editor or admin role
 */
export function useAdminTemplatesPaginatedQuery(params: {
	page: number;
	limit: number;
	status?: TemplateStatus | "all";
	sortBy?:
		| "title"
		| "status"
		| "estimated_scenes"
		| "created_at"
		| "updated_at";
	sortOrder?: "asc" | "desc";
	search?: string;
	enabled?: boolean;
}) {
	const {
		page,
		limit,
		status,
		sortBy,
		sortOrder,
		search,
		enabled = true,
	} = params;

	return useQuery({
		queryKey: [
			...adminTemplatesQueryKey,
			"paginated",
			page,
			limit,
			status || "all",
			sortBy || "updated_at",
			sortOrder || "desc",
			search || "",
		],
		queryFn: () => {
			const searchParams = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (status && status !== "all") {
				searchParams.set("status", status);
			}

			if (sortBy) {
				searchParams.set("sortBy", sortBy);
			}

			if (sortOrder) {
				searchParams.set("sortOrder", sortOrder);
			}

			if (search) {
				searchParams.set("search", search);
			}

			return api.get<{
				templates: Template[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
				};
			}>(`/api/admin/templates?${searchParams.toString()}`);
		},
		enabled,
	});
}

/**
 * Custom hook to fetch template statistics
 * Returns counts by status (total, draft, published, archived)
 * Requires editor or admin role
 */
export function useAdminTemplatesStatsQuery(enabled = true) {
	return useQuery({
		queryKey: adminTemplatesStatsQueryKey,
		queryFn: () =>
			api.get<{
				total: number;
				draft: number;
				published: number;
				archived: number;
			}>("/api/admin/templates/stats"),
		enabled,
	});
}
