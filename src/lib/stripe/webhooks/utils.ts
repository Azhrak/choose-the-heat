import { db } from "~/lib/db";

/**
 * Save webhook event to database for idempotency tracking
 *
 * @param eventId - Stripe event ID
 * @param eventType - Event type (e.g., 'invoice.paid')
 * @param payload - Full event payload
 * @returns True if event was saved (first time), false if already exists
 */
export async function saveWebhookEvent(
	eventId: string,
	eventType: string,
	payload: Record<string, unknown>,
): Promise<boolean> {
	try {
		await db
			.insertInto("webhook_events")
			.values({
				event_id: eventId,
				event_type: eventType,
				payload: JSON.stringify(payload),
				processed: false,
			})
			.execute();

		return true; // Successfully inserted, first time seeing this event
	} catch (_error) {
		// Unique constraint violation means event already exists
		return false;
	}
}

/**
 * Check if webhook event has already been processed
 *
 * @param eventId - Stripe event ID
 * @returns True if already processed, false if not
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
	const event = await db
		.selectFrom("webhook_events")
		.select("processed")
		.where("event_id", "=", eventId)
		.executeTakeFirst();

	return event?.processed || false;
}

/**
 * Mark webhook event as processed
 *
 * @param eventId - Stripe event ID
 * @param error - Error message if processing failed
 */
export async function markEventProcessed(
	eventId: string,
	error?: string,
): Promise<void> {
	await db
		.updateTable("webhook_events")
		.set({
			processed: true,
			processed_at: new Date(),
			error: error || null,
		})
		.where("event_id", "=", eventId)
		.execute();
}

/**
 * Get user ID from Stripe customer ID
 *
 * @param customerId - Stripe customer ID
 * @returns User ID or null if not found
 */
export async function getUserIdFromCustomerId(
	customerId: string,
): Promise<string | null> {
	const user = await db
		.selectFrom("users")
		.select("id")
		.where("stripe_customer_id", "=", customerId)
		.executeTakeFirst();

	return user?.id || null;
}

/**
 * Get user ID from Stripe subscription ID
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns User ID or null if not found
 */
export async function getUserIdFromSubscriptionId(
	subscriptionId: string,
): Promise<string | null> {
	const user = await db
		.selectFrom("users")
		.select("id")
		.where("stripe_subscription_id", "=", subscriptionId)
		.executeTakeFirst();

	return user?.id || null;
}
