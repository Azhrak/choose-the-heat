import { sql } from "kysely";
import { db } from "~/lib/db";
import type { SubscriptionTier } from "~/lib/db/types";

/**
 * Get all subscription tier limits with their pricing and features
 */
export async function getSubscriptionTiers() {
	return await db
		.selectFrom("subscription_tier_limits")
		.selectAll()
		.where("is_active", "=", true)
		.orderBy("price_monthly", "asc")
		.execute();
}

/**
 * Get a specific subscription tier's details
 */
export async function getSubscriptionTier(tier: SubscriptionTier) {
	return await db
		.selectFrom("subscription_tier_limits")
		.selectAll()
		.where("tier", "=", tier)
		.executeTakeFirst();
}

/**
 * Get user's current subscription info
 */
export async function getUserSubscription(userId: string) {
	return await db
		.selectFrom("users")
		.select([
			"subscription_tier",
			"subscription_start_date",
			"subscription_end_date",
			"subscription_auto_renew",
		])
		.where("id", "=", userId)
		.executeTakeFirst();
}

/**
 * Get user's usage for a specific date (defaults to today)
 */
export async function getUserUsage(userId: string, date?: Date) {
	const targetDate = date || new Date();
	const dateString = targetDate.toISOString().split("T")[0];

	return await db
		.selectFrom("usage_tracking")
		.selectAll()
		.where("user_id", "=", userId)
		.where(sql`date::text`, "=", dateString)
		.executeTakeFirst();
}

/**
 * Get or create usage tracking for user on a specific date
 */
export async function getOrCreateUserUsage(userId: string, date?: Date) {
	const targetDate = date || new Date();
	const dateString = targetDate.toISOString().split("T")[0];

	const existing = await getUserUsage(userId, targetDate);
	if (existing) {
		return existing;
	}

	return await db
		.insertInto("usage_tracking")
		.values({
			user_id: userId,
			date: dateString,
			text_generations: 0,
			voice_generations: 0,
		})
		.returningAll()
		.executeTakeFirstOrThrow();
}

/**
 * Increment text generation count for user
 */
export async function incrementTextGeneration(userId: string) {
	const dateString = new Date().toISOString().split("T")[0];

	await db
		.insertInto("usage_tracking")
		.values({
			user_id: userId,
			date: dateString,
			text_generations: 1,
			voice_generations: 0,
		})
		.onConflict((oc) =>
			oc.columns(["user_id", "date"]).doUpdateSet({
				text_generations: sql`text_generations + 1`,
				updated_at: new Date().toISOString(),
			}),
		)
		.execute();
}

/**
 * Increment voice generation count for user
 */
export async function incrementVoiceGeneration(userId: string) {
	const dateString = new Date().toISOString().split("T")[0];

	await db
		.insertInto("usage_tracking")
		.values({
			user_id: userId,
			date: dateString,
			text_generations: 0,
			voice_generations: 1,
		})
		.onConflict((oc) =>
			oc.columns(["user_id", "date"]).doUpdateSet({
				voice_generations: sql`voice_generations + 1`,
				updated_at: new Date().toISOString(),
			}),
		)
		.execute();
}

/**
 * Check if user can generate text (hasn't exceeded their daily limit)
 */
export async function canGenerateText(userId: string): Promise<boolean> {
	const user = await db
		.selectFrom("users")
		.select("subscription_tier")
		.where("id", "=", userId)
		.executeTakeFirst();

	if (!user) return false;

	const tierLimits = await getSubscriptionTier(user.subscription_tier);
	if (!tierLimits) return false;

	// Unlimited
	if (tierLimits.text_generations_per_day === -1) return true;

	const usage = await getUserUsage(userId);
	if (!usage) return true; // No usage yet today

	return usage.text_generations < tierLimits.text_generations_per_day;
}

/**
 * Check if user can generate voice (hasn't exceeded their daily limit)
 */
export async function canGenerateVoice(userId: string): Promise<boolean> {
	const user = await db
		.selectFrom("users")
		.select("subscription_tier")
		.where("id", "=", userId)
		.executeTakeFirst();

	if (!user) return false;

	const tierLimits = await getSubscriptionTier(user.subscription_tier);
	if (!tierLimits) return false;

	// No voice generation allowed
	if (tierLimits.voice_generations_per_day === 0) return false;

	// Unlimited
	if (tierLimits.voice_generations_per_day === -1) return true;

	const usage = await getUserUsage(userId);
	if (!usage) return true; // No usage yet today

	return usage.voice_generations < tierLimits.voice_generations_per_day;
}

/**
 * Get user's subscription transaction history
 */
export async function getUserTransactionHistory(userId: string) {
	return await db
		.selectFrom("subscription_transactions")
		.selectAll()
		.where("user_id", "=", userId)
		.orderBy("created_at", "desc")
		.execute();
}

/**
 * Update user's subscription tier
 */
export async function updateUserSubscription(
	userId: string,
	tier: SubscriptionTier,
	startDate: Date,
	endDate: Date,
) {
	return await db
		.updateTable("users")
		.set({
			subscription_tier: tier,
			subscription_start_date: startDate.toISOString(),
			subscription_end_date: endDate.toISOString(),
		})
		.where("id", "=", userId)
		.executeTakeFirst();
}

/**
 * Record a subscription transaction
 */
export async function createSubscriptionTransaction(data: {
	userId: string;
	tier: SubscriptionTier;
	amount: number;
	currency?: string;
	status: string;
	paymentProvider?: string;
	paymentProviderId?: string;
	metadata?: Record<string, unknown>;
}) {
	return await db
		.insertInto("subscription_transactions")
		.values({
			user_id: data.userId,
			tier: data.tier,
			amount: data.amount.toString(),
			currency: data.currency || "USD",
			status: data.status,
			payment_provider: data.paymentProvider,
			payment_provider_id: data.paymentProviderId,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
		})
		.returningAll()
		.executeTakeFirst();
}
