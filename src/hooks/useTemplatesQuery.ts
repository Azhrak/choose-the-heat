import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";
import type { Trope } from "~/lib/types/preferences";

interface TemplatesResponse {
	templates: Template[];
}

interface UseTemplatesQueryOptions {
	tropes?: Trope[];
	search?: string;
}

export const templatesQueryKey = (tropes: Trope[] = [], search = "") =>
	["templates", tropes, search] as const;

/**
 * Custom hook to fetch templates with optional filtering
 * @param options - Filter options for tropes and search
 */
export function useTemplatesQuery(options: UseTemplatesQueryOptions = {}) {
	const { tropes = [], search = "" } = options;

	return useQuery({
		queryKey: templatesQueryKey(tropes, search),
		queryFn: async () => {
			const params: Record<string, string> = {};
			if (tropes.length > 0) {
				params.tropes = tropes.join(",");
			}
			if (search) {
				params.search = search;
			}

			return await api.get<TemplatesResponse>("/api/templates", { params });
		},
	});
}
