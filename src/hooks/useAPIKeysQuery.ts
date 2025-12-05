import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

/**
 * API key metadata response
 */
interface APIKeyRecord {
	id: string;
	provider: string;
	encryptedKey: string;
	testStatus: "valid" | "invalid" | "untested" | null;
	testError: string | null;
	lastTestedAt: Date | null;
	updatedAt: Date;
	createdAt: Date;
}

interface APIKeysResponse {
	keys: APIKeyRecord[];
}

interface TestResult {
	valid: boolean;
	error?: string;
	message?: string;
}

/**
 * Fetch all API keys metadata
 */
export function useAPIKeysQuery() {
	return useQuery({
		queryKey: ["api-keys"],
		queryFn: async () => {
			return await api.get<APIKeysResponse>("/api/admin/api-keys");
		},
	});
}

/**
 * Update an API key
 */
export function useUpdateAPIKeyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			provider,
			apiKey,
		}: {
			provider: string;
			apiKey: string;
		}) => {
			return await api.put<{ success: boolean }>(
				`/api/admin/api-keys/${provider}`,
				{
					apiKey,
				},
			);
		},
		onSuccess: () => {
			// Invalidate and refetch API keys
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}

/**
 * Test an API key
 */
export function useTestAPIKeyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (provider: string) => {
			return await api.post<TestResult>(`/api/admin/api-keys/${provider}/test`);
		},
		onSuccess: () => {
			// Invalidate and refetch API keys to get updated test status
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}

/**
 * Delete an API key
 */
export function useDeleteAPIKeyMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (provider: string) => {
			return await api.delete<{ success: boolean }>(
				`/api/admin/api-keys/${provider}`,
			);
		},
		onSuccess: () => {
			// Invalidate and refetch API keys
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}
