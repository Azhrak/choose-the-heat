import { useQuery } from "@tanstack/react-query";

interface Trope {
	id: string;
	key: string;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

interface TropesResponse {
	tropes: Trope[];
}

export const tropesQueryKey = ["tropes"] as const;
export const adminTropesQueryKey = ["admin", "tropes"] as const;

/**
 * Hook to fetch all available tropes from the API
 */
export function useTropesQuery() {
	return useQuery<TropesResponse>({
		queryKey: tropesQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/tropes");
			if (!response.ok) {
				throw new Error("Failed to fetch tropes");
			}
			return response.json();
		},
		staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
	});
}

export function useTropeMap() {
	const { data } = useTropesQuery();
	const map: Record<string, string> = {};
	if (data?.tropes) {
		for (const trope of data.tropes) {
			map[trope.key] = trope.label;
		}
	}
	return map;
}

/**
 * Hook to fetch tropes with usage statistics (admin only)
 */
export function useAdminTropesQuery(enabled = true) {
	return useQuery<{ tropes: (Trope & { usageCount: number })[] }>({
		queryKey: adminTropesQueryKey,
		queryFn: async () => {
			const response = await fetch("/api/admin/tropes?withStats=true");
			if (!response.ok) {
				throw new Error("Failed to fetch tropes");
			}
			return response.json();
		},
		enabled,
		staleTime: 1 * 60 * 1000, // Consider fresh for 1 minute
	});
}
