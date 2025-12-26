import type Stripe from "stripe";
import { db } from "../db";
import { stripe } from "./client";

/**
 * Get or create a Stripe customer for a user
 * Uses lazy creation - only creates customer when user first needs to upgrade
 *
 * @param userId - User ID from our database
 * @param email - User's email address
 * @param name - User's display name (optional)
 * @returns Stripe Customer object
 */
export async function getOrCreateStripeCustomer(
	userId: string,
	email: string,
	name?: string,
): Promise<Stripe.Customer> {
	// Check if user already has a Stripe customer ID
	const user = await db
		.selectFrom("users")
		.select("stripe_customer_id")
		.where("id", "=", userId)
		.executeTakeFirst();

	// If customer exists, fetch and return it
	if (user?.stripe_customer_id) {
		try {
			const customer = await stripe.customers.retrieve(user.stripe_customer_id);
			if (customer.deleted) {
				// Customer was deleted in Stripe, create a new one
				console.warn(
					`Stripe customer ${user.stripe_customer_id} was deleted. Creating new customer.`,
				);
			} else {
				return customer as Stripe.Customer;
			}
		} catch (error) {
			console.error(
				`Failed to retrieve Stripe customer ${user.stripe_customer_id}:`,
				error,
			);
			// Continue to create new customer
		}
	}

	// Create new Stripe customer
	const customer = await stripe.customers.create({
		email,
		name: name || undefined,
		metadata: {
			userId, // Link back to our user ID
		},
	});

	// Store customer ID in database
	await db
		.updateTable("users")
		.set({ stripe_customer_id: customer.id })
		.where("id", "=", userId)
		.execute();

	// Also update billing_details if exists
	await db
		.updateTable("billing_details")
		.set({
			customer_id: customer.id,
			payment_provider: "stripe",
		})
		.where("user_id", "=", userId)
		.execute();

	return customer;
}

/**
 * Update Stripe customer information
 *
 * @param customerId - Stripe customer ID
 * @param data - Customer data to update
 * @returns Updated Stripe Customer object
 */
export async function updateStripeCustomer(
	customerId: string,
	data: {
		email?: string;
		name?: string;
		address?: Stripe.AddressParam;
		phone?: string;
		metadata?: Record<string, string>;
	},
): Promise<Stripe.Customer> {
	return await stripe.customers.update(customerId, data);
}

/**
 * Sync Stripe customer data to our billing_details table
 *
 * @param userId - User ID from our database
 * @param stripeCustomer - Stripe Customer object
 */
export async function syncCustomerToDatabase(
	userId: string,
	stripeCustomer: Stripe.Customer,
): Promise<void> {
	// Check if billing_details record exists
	const existing = await db
		.selectFrom("billing_details")
		.select("id")
		.where("user_id", "=", userId)
		.executeTakeFirst();

	const address = stripeCustomer.address;

	const billingData = {
		billing_name: stripeCustomer.name || null,
		billing_email: stripeCustomer.email || null,
		billing_address_line1: address?.line1 || null,
		billing_address_line2: address?.line2 || null,
		billing_city: address?.city || null,
		billing_state: address?.state || null,
		billing_postal_code: address?.postal_code || null,
		billing_country: address?.country || null,
		payment_provider: "stripe" as const,
		customer_id: stripeCustomer.id,
		updated_at: new Date(),
	};

	if (existing) {
		// Update existing record
		await db
			.updateTable("billing_details")
			.set(billingData)
			.where("user_id", "=", userId)
			.execute();
	} else {
		// Insert new record
		await db
			.insertInto("billing_details")
			.values({
				user_id: userId,
				...billingData,
			})
			.execute();
	}
}

/**
 * Get user ID from Stripe customer ID
 *
 * @param stripeCustomerId - Stripe customer ID
 * @returns User ID or null if not found
 */
export async function getUserIdFromStripeCustomer(
	stripeCustomerId: string,
): Promise<string | null> {
	const user = await db
		.selectFrom("users")
		.select("id")
		.where("stripe_customer_id", "=", stripeCustomerId)
		.executeTakeFirst();

	return user?.id || null;
}
