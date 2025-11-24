import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";
import type { Trope } from "~/lib/types/preferences";

interface PaginationInfo {
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface TemplatesResponse {
	templates: Template[];
	pagination: PaginationInfo;
}

interface UseTemplatesQueryOptions {
	tropes?: Trope[];
	search?: string;
	page?: number;
	limit?: number;
}

export const templatesQueryKey = (
	tropes: Trope[] = [],
	search = "",
	page = 1,
	limit = 15,
) => ["templates", tropes, search, page, limit] as const;

/**
 * Custom hook to fetch templates with optional filtering and pagination
 * @param options - Filter options for tropes, search, and pagination
 */
export function useTemplatesQuery(options: UseTemplatesQueryOptions = {}) {
	const { tropes = [], search = "", page = 1, limit = 15 } = options;

	return useQuery({
		queryKey: templatesQueryKey(tropes, search, page, limit),
		queryFn: async () => {
			const params: Record<string, string> = {};
			if (tropes.length > 0) {
				params.tropes = tropes.join(",");
			}
			if (search) {
				params.search = search;
			}
			params.page = page.toString();
			params.limit = limit.toString();

			return await api.get<TemplatesResponse>("/api/templates", { params });
		},
	});
}
