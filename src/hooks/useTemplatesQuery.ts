import { useQuery } from "@tanstack/react-query";
import type { Trope } from "~/lib/types/preferences";
import type { Template } from "~/lib/api/types";

interface TemplatesResponse {
	templates: Template[];
}

interface UseTemplatesQueryOptions {
	tropes?: Trope[];
	search?: string;
}

export const templatesQueryKey = (tropes: Trope[] = [], search = "") => ["templates", tropes, search] as const;

/**
 * Custom hook to fetch templates with optional filtering
 * @param options - Filter options for tropes and search
 */
export function useTemplatesQuery(options: UseTemplatesQueryOptions = {}) {
	const { tropes = [], search = "" } = options;

	return useQuery({
		queryKey: templatesQueryKey(tropes, search),
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (tropes.length > 0) {
				queryParams.set("tropes", tropes.join(","));
			}
			if (search) {
				queryParams.set("search", search);
			}

			const url = `/api/templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
			const response = await fetch(url, {
				credentials: "include",
			});
			if (!response.ok) throw new Error("Failed to fetch templates");
			return response.json() as Promise<TemplatesResponse>;
		},
	});
}
