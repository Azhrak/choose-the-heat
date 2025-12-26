import type Stripe from "stripe";
import { db } from "~/lib/db";
import { addPaymentMethod } from "~/lib/db/queries/billing";
import { getUserIdFromCustomerId } from "./utils";

/**
 * Handle payment_method.attached event
 * Add payment method to user's payment_methods table
 */
export async function handlePaymentMethodAttached(
	paymentMethod: Stripe.PaymentMethod,
) {
	// Payment method must be attached to a customer
	if (!paymentMethod.customer) {
		console.error(
			`[Payment Method Attached] No customer for payment method ${paymentMethod.id}`,
		);
		return;
	}

	// Get user ID from Stripe customer ID
	const userId = await getUserIdFromCustomerId(
		paymentMethod.customer as string,
	);

	if (!userId) {
		console.error(
			`[Payment Method Attached] User not found for customer ${paymentMethod.customer}`,
		);
		return;
	}

	// Extract payment method details based on type
	let cardBrand: string | undefined;
	let cardLast4: string | undefined;
	let cardExpMonth: number | undefined;
	let cardExpYear: number | undefined;

	if (paymentMethod.type === "card" && paymentMethod.card) {
		cardBrand = paymentMethod.card.brand;
		cardLast4 = paymentMethod.card.last4;
		cardExpMonth = paymentMethod.card.exp_month;
		cardExpYear = paymentMethod.card.exp_year;
	}

	// Add payment method to database
	await addPaymentMethod({
		userId,
		paymentProvider: "stripe",
		paymentProviderMethodId: paymentMethod.id,
		type: paymentMethod.type,
		cardBrand,
		cardLast4,
		cardExpMonth,
		cardExpYear,
		isDefault: false, // Will be set by customer.default_source event
		metadata: {
			billing_details: paymentMethod.billing_details,
			created: paymentMethod.created,
		},
	});

	console.log(
		`[Payment Method Attached] Added ${paymentMethod.type} payment method for user ${userId}`,
	);
}

/**
 * Handle payment_method.detached event
 * Remove payment method from user's payment_methods table
 */
export async function handlePaymentMethodDetached(
	paymentMethod: Stripe.PaymentMethod,
) {
	// Find and delete the payment method
	await db
		.deleteFrom("payment_methods")
		.where("payment_provider_method_id", "=", paymentMethod.id)
		.execute();

	console.log(
		`[Payment Method Detached] Removed payment method ${paymentMethod.id}`,
	);
}

/**
 * Handle charge.refunded event
 * Create a refund transaction record
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
	// Get user ID from customer
	if (!charge.customer) {
		console.error(`[Charge Refunded] No customer for charge ${charge.id}`);
		return;
	}

	const userId = await getUserIdFromCustomerId(charge.customer as string);

	if (!userId) {
		console.error(
			`[Charge Refunded] User not found for customer ${charge.customer}`,
		);
		return;
	}

	// Get refund amount
	const refundAmount = charge.amount_refunded / 100;

	// Get user's subscription tier
	const user = await db
		.selectFrom("users")
		.select("subscription_tier")
		.where("id", "=", userId)
		.executeTakeFirst();

	// Create refund transaction
	await db
		.insertInto("subscription_transactions")
		.values({
			user_id: userId,
			tier: user?.subscription_tier || "free",
			amount: refundAmount.toString(),
			currency: charge.currency.toUpperCase(),
			payment_provider: "stripe",
			payment_provider_id: charge.id,
			status: "completed",
			metadata: JSON.stringify({
				charge_id: charge.id,
				refund_reason: charge.refunds?.data[0]?.reason,
				refunded_at: charge.refunds?.data[0]?.created,
				description: `Refund for charge ${charge.id}`,
			}),
		})
		.execute();

	console.log(
		`[Charge Refunded] Recorded refund of ${refundAmount} ${charge.currency.toUpperCase()} for user ${userId}`,
	);
}

/**
 * Handle charge.failed event
 * Log failed payment attempt
 */
export async function handleChargeFailed(charge: Stripe.Charge) {
	// Get user ID from customer
	if (!charge.customer) {
		console.error(`[Charge Failed] No customer for charge ${charge.id}`);
		return;
	}

	const userId = await getUserIdFromCustomerId(charge.customer as string);

	if (!userId) {
		console.error(
			`[Charge Failed] User not found for customer ${charge.customer}`,
		);
		return;
	}

	// Log failed charge
	console.log(
		`[Charge Failed] Payment failed for user ${userId}: ${charge.failure_message}`,
	);

	// Get user's subscription tier
	const user = await db
		.selectFrom("users")
		.select("subscription_tier")
		.where("id", "=", userId)
		.executeTakeFirst();

	// Create failed transaction record
	await db
		.insertInto("subscription_transactions")
		.values({
			user_id: userId,
			tier: user?.subscription_tier || "free",
			amount: (charge.amount / 100).toString(),
			currency: charge.currency.toUpperCase(),
			payment_provider: "stripe",
			payment_provider_id: charge.id,
			status: "failed",
			metadata: JSON.stringify({
				charge_id: charge.id,
				failure_code: charge.failure_code,
				failure_message: charge.failure_message,
				description: `Failed payment: ${charge.failure_message}`,
			}),
		})
		.execute();
}
