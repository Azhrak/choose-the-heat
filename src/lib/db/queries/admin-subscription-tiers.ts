import { db } from "~/lib/db";
import type { SubscriptionTier } from "~/lib/db/types";
import { createOrUpdateTierInStripe } from "~/lib/stripe/products";

/**
 * Get all subscription tiers (admin only)
 */
export async function getAllSubscriptionTiers() {
	return db
		.selectFrom("subscription_tier_limits")
		.selectAll()
		.orderBy("price_monthly", "asc")
		.execute();
}

/**
 * Get single subscription tier by tier enum
 */
export async function getSubscriptionTierByTier(tier: SubscriptionTier) {
	return db
		.selectFrom("subscription_tier_limits")
		.selectAll()
		.where("tier", "=", tier)
		.executeTakeFirst();
}

/**
 * Get count of users on each subscription tier
 */
export async function getSubscriptionTierStats() {
	const stats = await db
		.selectFrom("users")
		.select(["subscription_tier as tier"])
		.select((eb) => eb.fn.count<number>("id").as("count"))
		.groupBy("subscription_tier")
		.execute();

	// Format as object for easy access
	return {
		free: stats.find((s) => s.tier === "free")?.count || 0,
		basic: stats.find((s) => s.tier === "basic")?.count || 0,
		premium: stats.find((s) => s.tier === "premium")?.count || 0,
		premium_plus: stats.find((s) => s.tier === "premium_plus")?.count || 0,
		total: stats.reduce((sum, s) => sum + Number(s.count), 0),
	};
}

/**
 * Update subscription tier
 * Also updates Stripe product/prices if pricing changes
 */
export async function updateSubscriptionTier(
	tier: SubscriptionTier,
	data: {
		name?: string;
		description?: string;
		price_monthly?: number;
		price_yearly?: number | null;
		text_generations_per_day?: number;
		voice_generations_per_day?: number;
		features?: Record<string, boolean>;
		is_active?: boolean;
	},
) {
	// Get current tier data
	const currentTier = await getSubscriptionTierByTier(tier);
	if (!currentTier) {
		throw new Error(`Tier ${tier} not found`);
	}

	// Update database
	const updated = await db
		.updateTable("subscription_tier_limits")
		.set({
			...data,
			updated_at: new Date(),
		})
		.where("tier", "=", tier)
		.returning([
			"tier",
			"name",
			"description",
			"price_monthly",
			"price_yearly",
			"text_generations_per_day",
			"voice_generations_per_day",
			"features",
		])
		.executeTakeFirstOrThrow();

	// If pricing changed, update Stripe
	const pricingChanged =
		data.price_monthly !== undefined || data.price_yearly !== undefined;

	if (pricingChanged) {
		try {
			await createOrUpdateTierInStripe({
				tier: updated.tier,
				name: updated.name,
				description: updated.description,
				price_monthly: updated.price_monthly,
				price_yearly: updated.price_yearly,
				text_generations_per_day: updated.text_generations_per_day,
				voice_generations_per_day: updated.voice_generations_per_day,
				features: updated.features,
			});
		} catch (error) {
			console.error(`Failed to update tier ${tier} in Stripe:`, error);
			// Don't throw - database update succeeded, Stripe sync can be retried
		}
	}

	return updated;
}

/**
 * Toggle tier active status (soft delete)
 */
export async function toggleSubscriptionTierStatus(tier: SubscriptionTier) {
	const currentTier = await getSubscriptionTierByTier(tier);
	if (!currentTier) {
		throw new Error(`Tier ${tier} not found`);
	}

	// Prevent deactivating free tier
	if (tier === "free") {
		throw new Error("Cannot deactivate free tier");
	}

	// Check if users are on this tier
	const usersOnTier = await db
		.selectFrom("users")
		.select((eb) => eb.fn.count<number>("id").as("count"))
		.where("subscription_tier", "=", tier)
		.executeTakeFirst();

	if (usersOnTier && Number(usersOnTier.count) > 0 && currentTier.is_active) {
		throw new Error(
			`Cannot deactivate tier with ${usersOnTier.count} active user(s)`,
		);
	}

	return db
		.updateTable("subscription_tier_limits")
		.set({
			is_active: !currentTier.is_active,
			updated_at: new Date(),
		})
		.where("tier", "=", tier)
		.returning(["tier", "is_active"])
		.executeTakeFirstOrThrow();
}

/**
 * Sync tier to Stripe (create or update product/prices)
 */
export async function syncTierToStripe(tier: SubscriptionTier) {
	const tierData = await getSubscriptionTierByTier(tier);
	if (!tierData) {
		throw new Error(`Tier ${tier} not found`);
	}

	const result = await createOrUpdateTierInStripe({
		tier: tierData.tier,
		name: tierData.name,
		description: tierData.description,
		price_monthly: tierData.price_monthly,
		price_yearly: tierData.price_yearly,
		text_generations_per_day: tierData.text_generations_per_day,
		voice_generations_per_day: tierData.voice_generations_per_day,
		features: tierData.features,
	});

	return result;
}
