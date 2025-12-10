import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { ProviderStatusInfo } from "~/lib/ai/providerStatus";

interface ProviderStatusResponse {
	statuses: ProviderStatusInfo[];
}

interface ActivateProviderResponse {
	success: boolean;
	provider: string;
	model: string;
}

/**
 * Fetch provider statuses for a category (text or tts)
 */
export function useProviderStatusQuery(category: "text" | "tts") {
	return useQuery({
		queryKey: ["provider-status", category],
		queryFn: async () => {
			return await api.get<ProviderStatusResponse>(
				`/api/admin/providers/status?category=${category}`,
			);
		},
		refetchInterval: 30000, // Refresh every 30 seconds
	});
}

/**
 * Activate a provider (set it as the current active provider)
 */
export function useActivateProviderMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			provider,
			category,
		}: {
			provider: string;
			category: "text" | "tts";
		}) => {
			return await api.post<ActivateProviderResponse>(
				"/api/admin/providers/activate",
				{
					provider,
					category,
				},
			);
		},
		onSuccess: (_data, variables) => {
			// Invalidate provider status to refresh the UI
			queryClient.invalidateQueries({
				queryKey: ["provider-status", variables.category],
			});
			// Also invalidate settings since we changed the active provider
			queryClient.invalidateQueries({ queryKey: ["settings"] });
		},
	});
}
