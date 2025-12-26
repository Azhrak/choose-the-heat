import type Stripe from "stripe";
import { db } from "../db";
import type { JsonValue, SubscriptionTier } from "../db/types";
import { STRIPE_CONFIG, stripe } from "./client";

interface TierData {
	tier: SubscriptionTier;
	name: string;
	description: string | null;
	price_monthly: string | number;
	price_yearly: string | number | null;
	text_generations_per_day: number;
	voice_generations_per_day: number;
	features: JsonValue;
}

interface CreateOrUpdateResult {
	productId: string;
	monthlyPriceId: string;
	yearlyPriceId: string | null;
}

/**
 * Create or update a subscription tier in Stripe
 * Creates a Stripe Product and associated Prices (monthly and yearly)
 *
 * Following Stripe best practices:
 * - Products can be updated
 * - Prices are immutable - always create new prices when pricing changes
 * - Old prices are archived (not deleted) to preserve subscription history
 *
 * @param tierData - Subscription tier data from database
 * @returns Object containing Stripe product and price IDs
 */
export async function createOrUpdateTierInStripe(
	tierData: TierData,
): Promise<CreateOrUpdateResult> {
	const { tier, name, description, price_monthly, price_yearly } = tierData;

	// Check if tier already has a Stripe product
	const existingTier = await db
		.selectFrom("subscription_tier_limits")
		.select([
			"stripe_product_id",
			"stripe_price_id_monthly",
			"stripe_price_id_yearly",
		])
		.where("tier", "=", tier)
		.executeTakeFirst();

	let productId: string;

	// Create or update Stripe product
	if (existingTier?.stripe_product_id) {
		// Product exists, update it
		try {
			await stripe.products.update(existingTier.stripe_product_id, {
				name,
				description: description || undefined,
				metadata: {
					tier,
					app: "spicy-tales",
				},
			});
			productId = existingTier.stripe_product_id;
		} catch (error) {
			console.error(
				`Failed to update Stripe product ${existingTier.stripe_product_id}:`,
				error,
			);
			// Product may have been deleted, create new one
			const product = await stripe.products.create({
				name,
				description: description || undefined,
				metadata: {
					tier,
					app: "spicy-tales",
				},
			});
			productId = product.id;
		}
	} else {
		// Create new product
		const product = await stripe.products.create({
			name,
			description: description || undefined,
			metadata: {
				tier,
				app: "spicy-tales",
			},
		});
		productId = product.id;
	}

	// Create new prices (always create new - Stripe best practice)
	// Old prices will be archived if they exist

	// Monthly price
	const monthlyPrice = await stripe.prices.create({
		product: productId,
		currency: STRIPE_CONFIG.currency,
		recurring: {
			interval: "month",
		},
		unit_amount: Math.round(Number(price_monthly) * 100), // Convert to cents
		metadata: {
			tier,
			billing_period: "monthly",
		},
	});

	// Yearly price (if provided)
	let yearlyPrice: Stripe.Price | null = null;
	if (price_yearly && Number(price_yearly) > 0) {
		yearlyPrice = await stripe.prices.create({
			product: productId,
			currency: STRIPE_CONFIG.currency,
			recurring: {
				interval: "year",
			},
			unit_amount: Math.round(Number(price_yearly) * 100), // Convert to cents
			metadata: {
				tier,
				billing_period: "yearly",
			},
		});
	}

	// Archive old prices if they exist and are different
	if (
		existingTier?.stripe_price_id_monthly &&
		existingTier.stripe_price_id_monthly !== monthlyPrice.id
	) {
		await archiveStripePrice(existingTier.stripe_price_id_monthly);
	}

	if (
		existingTier?.stripe_price_id_yearly &&
		existingTier.stripe_price_id_yearly !== yearlyPrice?.id
	) {
		await archiveStripePrice(existingTier.stripe_price_id_yearly);
	}

	// Update database with new Stripe IDs
	await db
		.updateTable("subscription_tier_limits")
		.set({
			stripe_product_id: productId,
			stripe_price_id_monthly: monthlyPrice.id,
			stripe_price_id_yearly: yearlyPrice?.id || null,
			stripe_metadata: JSON.stringify({
				last_synced: new Date().toISOString(),
			}),
		})
		.where("tier", "=", tier)
		.execute();

	return {
		productId,
		monthlyPriceId: monthlyPrice.id,
		yearlyPriceId: yearlyPrice?.id || null,
	};
}

/**
 * Archive a Stripe price
 * Archived prices can no longer be used for new subscriptions,
 * but existing subscriptions continue unchanged
 *
 * @param priceId - Stripe price ID to archive
 */
export async function archiveStripePrice(priceId: string): Promise<void> {
	try {
		await stripe.prices.update(priceId, {
			active: false,
		});
		console.log(`Archived Stripe price: ${priceId}`);
	} catch (error) {
		console.error(`Failed to archive Stripe price ${priceId}:`, error);
		// Don't throw - archiving old prices is not critical
	}
}

/**
 * Get Stripe product for a tier
 *
 * @param tier - Subscription tier
 * @returns Stripe Product object or null if not found
 */
export async function getStripeProductForTier(
	tier: SubscriptionTier,
): Promise<Stripe.Product | null> {
	const tierData = await db
		.selectFrom("subscription_tier_limits")
		.select("stripe_product_id")
		.where("tier", "=", tier)
		.executeTakeFirst();

	if (!tierData?.stripe_product_id) {
		return null;
	}

	try {
		const product = await stripe.products.retrieve(tierData.stripe_product_id);
		return product.deleted ? null : product;
	} catch (error) {
		console.error(
			`Failed to retrieve Stripe product ${tierData.stripe_product_id}:`,
			error,
		);
		return null;
	}
}

/**
 * Get Stripe price for a tier
 *
 * @param tier - Subscription tier
 * @param billingPeriod - 'monthly' or 'yearly'
 * @returns Stripe Price object or null if not found
 */
export async function getStripePriceForTier(
	tier: SubscriptionTier,
	billingPeriod: "monthly" | "yearly",
): Promise<Stripe.Price | null> {
	const tierData = await db
		.selectFrom("subscription_tier_limits")
		.select(["stripe_price_id_monthly", "stripe_price_id_yearly"])
		.where("tier", "=", tier)
		.executeTakeFirst();

	const priceId =
		billingPeriod === "monthly"
			? tierData?.stripe_price_id_monthly
			: tierData?.stripe_price_id_yearly;

	if (!priceId) {
		return null;
	}

	try {
		const price = await stripe.prices.retrieve(priceId);
		return price.active ? price : null;
	} catch (error) {
		console.error(`Failed to retrieve Stripe price ${priceId}:`, error);
		return null;
	}
}

/**
 * Sync all tiers to Stripe
 * Useful for initial setup or recovery
 *
 * @returns Array of results for each tier
 */
export async function syncAllTiersToStripe(): Promise<
	Array<{
		tier: SubscriptionTier;
		success: boolean;
		error?: string;
		result?: CreateOrUpdateResult;
	}>
> {
	const tiers = await db
		.selectFrom("subscription_tier_limits")
		.selectAll()
		.execute();

	const results = [];

	for (const tier of tiers) {
		try {
			const result = await createOrUpdateTierInStripe(tier);
			results.push({
				tier: tier.tier,
				success: true,
				result,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`Failed to sync tier ${tier.tier} to Stripe:`, error);
			results.push({
				tier: tier.tier,
				success: false,
				error: errorMessage,
			});
		}
	}

	return results;
}
