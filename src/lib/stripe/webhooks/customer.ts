import type Stripe from "stripe";
import { upsertBillingDetails } from "~/lib/db/queries/billing";
import { getUserIdFromCustomerId } from "./utils";

/**
 * Handle customer.updated event
 * Sync customer details to billing_details table
 */
export async function handleCustomerUpdated(customer: Stripe.Customer) {
	// Get user ID from Stripe customer ID
	const userId = await getUserIdFromCustomerId(customer.id);

	if (!userId) {
		console.error(
			`[Customer Updated] User not found for customer ${customer.id}`,
		);
		return;
	}

	// Extract billing address from customer
	const address = customer.address;

	// Update billing details
	await upsertBillingDetails(userId, {
		billingName: customer.name || undefined,
		billingEmail: customer.email || undefined,
		billingAddressLine1: address?.line1 || undefined,
		billingAddressLine2: address?.line2 || undefined,
		billingCity: address?.city || undefined,
		billingState: address?.state || undefined,
		billingPostalCode: address?.postal_code || undefined,
		billingCountry: address?.country || undefined,
		taxId: customer.tax_ids?.data[0]?.value || undefined,
		taxIdType: customer.tax_ids?.data[0]?.type || undefined,
		paymentProvider: "stripe",
		customerId: customer.id,
	});

	console.log(`[Customer Updated] Synced billing details for user ${userId}`);
}

/**
 * Handle customer.deleted event
 * Clean up customer references when a customer is deleted in Stripe
 */
export async function handleCustomerDeleted(customer: Stripe.Customer) {
	// Get user ID from Stripe customer ID
	const userId = await getUserIdFromCustomerId(customer.id);

	if (!userId) {
		console.error(
			`[Customer Deleted] User not found for customer ${customer.id}`,
		);
		return;
	}

	// Note: We keep the billing details for historical records
	// but we should clear the stripe_customer_id from the user
	// This is handled in the queries module
	console.log(
		`[Customer Deleted] Customer ${customer.id} deleted for user ${userId}`,
	);
}
