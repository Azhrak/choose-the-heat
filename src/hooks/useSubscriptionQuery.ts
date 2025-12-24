import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { SubscriptionTier } from "~/lib/db/types";

export interface SubscriptionTierInfo {
	tier: SubscriptionTier;
	name: string;
	description: string | null;
	price_monthly: string;
	price_yearly: string | null;
	text_generations_per_day: number;
	voice_generations_per_day: number;
	features: Record<string, unknown>;
	is_active: boolean;
}

export interface UserSubscriptionInfo {
	subscription_tier: SubscriptionTier;
	subscription_start_date: string | null;
	subscription_end_date: string | null;
	subscription_auto_renew: boolean;
}

export interface UserUsageInfo {
	text_generations: number;
	voice_generations: number;
	date: string;
}

export const subscriptionTiersQueryKey = ["subscriptionTiers"] as const;
export const userSubscriptionQueryKey = ["userSubscription"] as const;
export const userUsageQueryKey = ["userUsage"] as const;

/**
 * Get all available subscription tiers
 */
export function useSubscriptionTiersQuery() {
	return useQuery({
		queryKey: subscriptionTiersQueryKey,
		queryFn: async () => {
			return await api.get<SubscriptionTierInfo[]>("/api/subscriptions/tiers");
		},
	});
}

/**
 * Get current user's subscription info
 */
export function useUserSubscriptionQuery() {
	return useQuery({
		queryKey: userSubscriptionQueryKey,
		queryFn: async () => {
			return await api.get<UserSubscriptionInfo>(
				"/api/subscriptions/my-subscription",
			);
		},
	});
}

/**
 * Get current user's usage for today
 */
export function useUserUsageQuery() {
	return useQuery({
		queryKey: userUsageQueryKey,
		queryFn: async () => {
			return await api.get<UserUsageInfo>("/api/subscriptions/usage");
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	});
}
