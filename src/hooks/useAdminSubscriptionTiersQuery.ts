import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SubscriptionTier } from "~/lib/db/types";

// Response types
interface SubscriptionTierData {
	tier: SubscriptionTier;
	name: string;
	description: string | null;
	price_monthly: string;
	price_yearly: string | null;
	text_generations_per_day: number;
	voice_generations_per_day: number;
	features: Record<string, boolean> | null;
	is_active: boolean;
	stripe_product_id: string | null;
	stripe_price_id_monthly: string | null;
	stripe_price_id_yearly: string | null;
	stripe_metadata: Record<string, unknown> | null;
	created_at: Date;
	updated_at: Date;
}

interface TierStats {
	free: number;
	basic: number;
	premium: number;
	premium_plus: number;
	total: number;
}

interface TiersResponse {
	tiers: SubscriptionTierData[];
	stats: TierStats;
}

interface UpdateTierData {
	name?: string;
	description?: string | null;
	price_monthly?: number;
	price_yearly?: number | null;
	text_generations_per_day?: number;
	voice_generations_per_day?: number;
	features?: {
		priority_support?: boolean;
		advanced_ai_models?: boolean;
		early_access?: boolean;
	};
	is_active?: boolean;
}

// Query keys
const adminTiersKeys = {
	all: ["admin", "subscription-tiers"] as const,
	lists: () => [...adminTiersKeys.all, "list"] as const,
	detail: (id: SubscriptionTier) =>
		[...adminTiersKeys.all, "detail", id] as const,
};

/**
 * Query hook to fetch all subscription tiers with stats
 */
export function useAdminTiersQuery() {
	return useQuery({
		queryKey: adminTiersKeys.lists(),
		queryFn: async (): Promise<TiersResponse> => {
			const response = await fetch("/api/admin/subscription-tiers");

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to fetch subscription tiers");
			}

			return response.json();
		},
	});
}

/**
 * Query hook to fetch a single subscription tier
 */
export function useAdminTierQuery(tierId: SubscriptionTier | null) {
	return useQuery({
		queryKey: tierId
			? adminTiersKeys.detail(tierId)
			: ["admin", "subscription-tiers", "none"],
		queryFn: async (): Promise<{ tier: SubscriptionTierData }> => {
			if (!tierId) {
				throw new Error("Tier ID is required");
			}
			const response = await fetch(`/api/admin/subscription-tiers/${tierId}`);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to fetch subscription tier");
			}

			return response.json();
		},
		enabled: !!tierId,
	});
}

/**
 * Mutation hook to update a subscription tier
 */
export function useUpdateTierMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			tierId,
			data,
		}: {
			tierId: SubscriptionTier;
			data: UpdateTierData;
		}) => {
			const response = await fetch(`/api/admin/subscription-tiers/${tierId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update subscription tier");
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			// Invalidate queries to refetch data
			queryClient.invalidateQueries({ queryKey: adminTiersKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: adminTiersKeys.detail(variables.tierId),
			});
		},
	});
}

/**
 * Mutation hook to toggle tier status (activate/deactivate)
 */
export function useToggleTierStatusMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (tierId: SubscriptionTier) => {
			const response = await fetch(`/api/admin/subscription-tiers/${tierId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to toggle tier status");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate queries to refetch data
			queryClient.invalidateQueries({ queryKey: adminTiersKeys.lists() });
		},
	});
}

/**
 * Mutation hook to manually sync all tiers to Stripe
 */
export function useSyncTiersToStripeMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await fetch(
				"/api/admin/subscription-tiers/sync-stripe",
				{
					method: "POST",
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to sync tiers to Stripe");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate queries to refetch updated Stripe IDs
			queryClient.invalidateQueries({ queryKey: adminTiersKeys.lists() });
		},
	});
}
