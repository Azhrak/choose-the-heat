import type Stripe from "stripe";
import {
	cancelUserSubscription,
	createSubscriptionTransaction,
	getTierFromPriceId,
	updateSubscriptionAutoRenew,
	updateUserSubscription,
} from "../queries";
import { getUserIdFromCustomerId, getUserIdFromSubscriptionId } from "./utils";

// Helper type for webhook Subscription data which may have expanded fields
type WebhookSubscription = Stripe.Subscription & {
	current_period_start: number;
	current_period_end: number;
};

/**
 * Handle customer.subscription.created event
 * Update user's tier and subscription details when a new subscription is created
 */
export async function handleSubscriptionCreated(
	subscription: WebhookSubscription,
) {
	// Get user ID from Stripe customer ID
	const userId = await getUserIdFromCustomerId(subscription.customer as string);

	if (!userId) {
		console.error(
			`[Subscription Created] User not found for customer ${subscription.customer}`,
		);
		return;
	}

	// Get tier from price ID
	const priceId = subscription.items.data[0]?.price.id;
	if (!priceId) {
		console.error(
			`[Subscription Created] No price ID found for subscription ${subscription.id}`,
		);
		return;
	}

	const tier = await getTierFromPriceId(priceId);
	if (!tier) {
		console.error(`[Subscription Created] Invalid tier for price ${priceId}`);
		return;
	}

	// Update user subscription
	await updateUserSubscription(
		userId,
		tier,
		subscription.id,
		new Date(subscription.current_period_start * 1000),
		new Date(subscription.current_period_end * 1000),
		!subscription.cancel_at_period_end,
	);

	// Create transaction record
	const unitAmount = subscription.items.data[0].price.unit_amount;
	await createSubscriptionTransaction({
		userId,
		tier,
		amount: (unitAmount || 0) / 100,
		currency: subscription.currency,
		status: "completed",
		paymentProvider: "stripe",
		paymentProviderId: subscription.id,
		metadata: {
			subscription_id: subscription.id,
			price_id: priceId,
			period_start: subscription.current_period_start,
			period_end: subscription.current_period_end,
		},
	});

	console.log(
		`[Subscription Created] Activated ${tier} tier for user ${userId}`,
	);
}

/**
 * Handle customer.subscription.updated event
 * Update user's subscription details when subscription changes
 */
export async function handleSubscriptionUpdated(
	subscription: WebhookSubscription,
) {
	// Get user ID from subscription ID (user should already exist with this subscription)
	const userId = await getUserIdFromSubscriptionId(subscription.id);

	if (!userId) {
		console.error(
			`[Subscription Updated] User not found for subscription ${subscription.id}`,
		);
		return;
	}

	// Handle cancellation scheduling (cancel_at_period_end = true)
	if (subscription.cancel_at_period_end) {
		await updateSubscriptionAutoRenew(userId, false);
		console.log(
			`[Subscription Updated] Subscription ${subscription.id} scheduled for cancellation`,
		);
		return;
	}

	// Handle reactivation (cancel_at_period_end changed back to false)
	if (!subscription.cancel_at_period_end) {
		await updateSubscriptionAutoRenew(userId, true);
		console.log(
			`[Subscription Updated] Subscription ${subscription.id} reactivated`,
		);
	}

	// Get tier from price ID (might have changed if user upgraded/downgraded)
	const priceId = subscription.items.data[0]?.price.id;
	if (!priceId) {
		console.error(
			`[Subscription Updated] No price ID found for subscription ${subscription.id}`,
		);
		return;
	}

	const tier = await getTierFromPriceId(priceId);
	if (!tier) {
		console.error(`[Subscription Updated] Invalid tier for price ${priceId}`);
		return;
	}

	// Update user subscription with potentially new tier/dates
	await updateUserSubscription(
		userId,
		tier,
		subscription.id,
		new Date(subscription.current_period_start * 1000),
		new Date(subscription.current_period_end * 1000),
		!subscription.cancel_at_period_end,
	);

	console.log(
		`[Subscription Updated] Updated subscription for user ${userId} to ${tier}`,
	);
}

/**
 * Handle customer.subscription.deleted event
 * Revert user to free tier when subscription is cancelled
 */
export async function handleSubscriptionDeleted(
	subscription: WebhookSubscription,
) {
	// Get user ID from subscription ID
	const userId = await getUserIdFromSubscriptionId(subscription.id);

	if (!userId) {
		console.error(
			`[Subscription Deleted] User not found for subscription ${subscription.id}`,
		);
		return;
	}

	// Revert user to free tier
	await cancelUserSubscription(userId);

	// Create transaction record for cancellation
	await createSubscriptionTransaction({
		userId,
		tier: "free",
		amount: 0,
		currency: subscription.currency,
		status: "completed",
		paymentProvider: "stripe",
		paymentProviderId: subscription.id,
		metadata: {
			subscription_id: subscription.id,
			cancellation_reason: subscription.cancellation_details?.reason,
			canceled_at: subscription.canceled_at,
		},
	});

	console.log(`[Subscription Deleted] Reverted user ${userId} to free tier`);
}
