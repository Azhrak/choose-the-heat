import { db } from "../db";
import type { SubscriptionTier } from "../db/types";

/**
 * Update user's subscription information from Stripe data
 *
 * @param userId - User ID
 * @param tier - New subscription tier
 * @param stripeSubscriptionId - Stripe subscription ID
 * @param currentPeriodStart - Subscription period start date
 * @param currentPeriodEnd - Subscription period end date
 * @param autoRenew - Whether subscription will auto-renew
 */
export async function updateUserSubscription(
	userId: string,
	tier: SubscriptionTier,
	stripeSubscriptionId: string,
	currentPeriodStart: Date,
	currentPeriodEnd: Date,
	autoRenew: boolean,
): Promise<void> {
	await db
		.updateTable("users")
		.set({
			subscription_tier: tier,
			stripe_subscription_id: stripeSubscriptionId,
			subscription_start_date: currentPeriodStart,
			subscription_end_date: currentPeriodEnd,
			subscription_auto_renew: autoRenew,
		})
		.where("id", "=", userId)
		.execute();
}

/**
 * Cancel user's subscription (revert to free tier)
 *
 * @param userId - User ID
 */
export async function cancelUserSubscription(userId: string): Promise<void> {
	await db
		.updateTable("users")
		.set({
			subscription_tier: "free",
			stripe_subscription_id: null,
			subscription_end_date: null,
			subscription_auto_renew: false,
		})
		.where("id", "=", userId)
		.execute();
}

/**
 * Update subscription auto-renew status
 *
 * @param userId - User ID
 * @param autoRenew - Whether subscription will auto-renew
 */
export async function updateSubscriptionAutoRenew(
	userId: string,
	autoRenew: boolean,
): Promise<void> {
	await db
		.updateTable("users")
		.set({
			subscription_auto_renew: autoRenew,
		})
		.where("id", "=", userId)
		.execute();
}

/**
 * Create a subscription transaction record
 *
 * @param data - Transaction data
 */
export async function createSubscriptionTransaction(data: {
	userId: string;
	tier: SubscriptionTier;
	amount: number;
	currency: string;
	status: "pending" | "completed" | "failed" | "refunded";
	paymentProvider: string;
	paymentProviderId: string;
	metadata?: Record<string, unknown>;
}): Promise<void> {
	await db
		.insertInto("subscription_transactions")
		.values({
			user_id: data.userId,
			tier: data.tier,
			amount: data.amount.toString(),
			currency: data.currency.toUpperCase(),
			status: data.status,
			payment_provider: data.paymentProvider,
			payment_provider_id: data.paymentProviderId,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
		})
		.execute();
}

/**
 * Get tier enum value from Stripe metadata or product name
 *
 * @param tierString - Tier string from Stripe (e.g., 'basic', 'premium')
 * @returns Subscription tier enum value or null if invalid
 */
export function getTierFromString(tierString: string): SubscriptionTier | null {
	const normalized = tierString.toLowerCase().trim();

	switch (normalized) {
		case "free":
			return "free";
		case "basic":
			return "basic";
		case "premium":
			return "premium";
		case "premium_plus":
		case "premium-plus":
		case "premiumplus":
			return "premium_plus";
		default:
			return null;
	}
}

/**
 * Get tier from Stripe price ID
 *
 * @param priceId - Stripe price ID
 * @returns Subscription tier or null if not found
 */
export async function getTierFromPriceId(
	priceId: string,
): Promise<SubscriptionTier | null> {
	const tier = await db
		.selectFrom("subscription_tier_limits")
		.select("tier")
		.where((eb) =>
			eb.or([
				eb("stripe_price_id_monthly", "=", priceId),
				eb("stripe_price_id_yearly", "=", priceId),
			]),
		)
		.executeTakeFirst();

	return tier?.tier || null;
}

/**
 * Update user's Stripe customer ID
 *
 * @param userId - User ID
 * @param stripeCustomerId - Stripe customer ID
 */
export async function updateUserStripeCustomerId(
	userId: string,
	stripeCustomerId: string,
): Promise<void> {
	await db
		.updateTable("users")
		.set({ stripe_customer_id: stripeCustomerId })
		.where("id", "=", userId)
		.execute();
}

/**
 * Get user by Stripe customer ID
 *
 * @param stripeCustomerId - Stripe customer ID
 * @returns User or null if not found
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
	return await db
		.selectFrom("users")
		.selectAll()
		.where("stripe_customer_id", "=", stripeCustomerId)
		.executeTakeFirst();
}

/**
 * Get user by Stripe subscription ID
 *
 * @param stripeSubscriptionId - Stripe subscription ID
 * @returns User or null if not found
 */
export async function getUserByStripeSubscriptionId(
	stripeSubscriptionId: string,
) {
	return await db
		.selectFrom("users")
		.selectAll()
		.where("stripe_subscription_id", "=", stripeSubscriptionId)
		.executeTakeFirst();
}
