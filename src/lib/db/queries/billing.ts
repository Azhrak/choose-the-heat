import { db } from "~/lib/db";

/**
 * Get user's billing details
 */
export async function getBillingDetails(userId: string) {
	return await db
		.selectFrom("billing_details")
		.selectAll()
		.where("user_id", "=", userId)
		.executeTakeFirst();
}

/**
 * Create or update billing details for a user
 */
export async function upsertBillingDetails(
	userId: string,
	details: {
		paymentMethodId?: string;
		cardBrand?: string;
		cardLast4?: string;
		cardExpMonth?: number;
		cardExpYear?: number;
		billingName?: string;
		billingEmail?: string;
		billingAddressLine1?: string;
		billingAddressLine2?: string;
		billingCity?: string;
		billingState?: string;
		billingPostalCode?: string;
		billingCountry?: string;
		taxId?: string;
		taxIdType?: string;
		paymentProvider?: string;
		customerId?: string;
	},
) {
	const existing = await getBillingDetails(userId);

	if (existing) {
		return await db
			.updateTable("billing_details")
			.set({
				payment_method_id: details.paymentMethodId,
				card_brand: details.cardBrand,
				card_last4: details.cardLast4,
				card_exp_month: details.cardExpMonth,
				card_exp_year: details.cardExpYear,
				billing_name: details.billingName,
				billing_email: details.billingEmail,
				billing_address_line1: details.billingAddressLine1,
				billing_address_line2: details.billingAddressLine2,
				billing_city: details.billingCity,
				billing_state: details.billingState,
				billing_postal_code: details.billingPostalCode,
				billing_country: details.billingCountry,
				tax_id: details.taxId,
				tax_id_type: details.taxIdType,
				payment_provider: details.paymentProvider,
				customer_id: details.customerId,
				updated_at: new Date().toISOString(),
			})
			.where("user_id", "=", userId)
			.returningAll()
			.executeTakeFirst();
	}

	return await db
		.insertInto("billing_details")
		.values({
			user_id: userId,
			payment_method_id: details.paymentMethodId,
			card_brand: details.cardBrand,
			card_last4: details.cardLast4,
			card_exp_month: details.cardExpMonth,
			card_exp_year: details.cardExpYear,
			billing_name: details.billingName,
			billing_email: details.billingEmail,
			billing_address_line1: details.billingAddressLine1,
			billing_address_line2: details.billingAddressLine2,
			billing_city: details.billingCity,
			billing_state: details.billingState,
			billing_postal_code: details.billingPostalCode,
			billing_country: details.billingCountry,
			tax_id: details.taxId,
			tax_id_type: details.taxIdType,
			payment_provider: details.paymentProvider,
			customer_id: details.customerId,
		})
		.returningAll()
		.executeTakeFirst();
}

/**
 * Get user's payment methods
 */
export async function getPaymentMethods(userId: string) {
	return await db
		.selectFrom("payment_methods")
		.selectAll()
		.where("user_id", "=", userId)
		.orderBy("is_default", "desc")
		.orderBy("created_at", "desc")
		.execute();
}

/**
 * Get default payment method for user
 */
export async function getDefaultPaymentMethod(userId: string) {
	return await db
		.selectFrom("payment_methods")
		.selectAll()
		.where("user_id", "=", userId)
		.where("is_default", "=", true)
		.executeTakeFirst();
}

/**
 * Add a new payment method
 */
export async function addPaymentMethod(data: {
	userId: string;
	paymentProvider: string;
	paymentProviderMethodId: string;
	type: string;
	cardBrand?: string;
	cardLast4?: string;
	cardExpMonth?: number;
	cardExpYear?: number;
	paypalEmail?: string;
	isDefault?: boolean;
	metadata?: Record<string, unknown>;
}) {
	// If this is set as default, unset other defaults
	if (data.isDefault) {
		await db
			.updateTable("payment_methods")
			.set({ is_default: false })
			.where("user_id", "=", data.userId)
			.execute();
	}

	return await db
		.insertInto("payment_methods")
		.values({
			user_id: data.userId,
			payment_provider: data.paymentProvider,
			payment_provider_method_id: data.paymentProviderMethodId,
			type: data.type,
			card_brand: data.cardBrand,
			card_last4: data.cardLast4,
			card_exp_month: data.cardExpMonth,
			card_exp_year: data.cardExpYear,
			paypal_email: data.paypalEmail,
			is_default: data.isDefault || false,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
		})
		.returningAll()
		.executeTakeFirst();
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(
	userId: string,
	methodId: string,
) {
	// Unset all defaults for this user
	await db
		.updateTable("payment_methods")
		.set({ is_default: false })
		.where("user_id", "=", userId)
		.execute();

	// Set the new default
	return await db
		.updateTable("payment_methods")
		.set({ is_default: true, updated_at: new Date().toISOString() })
		.where("id", "=", methodId)
		.where("user_id", "=", userId)
		.returningAll()
		.executeTakeFirst();
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(userId: string, methodId: string) {
	return await db
		.deleteFrom("payment_methods")
		.where("id", "=", methodId)
		.where("user_id", "=", userId)
		.execute();
}

/**
 * Get user's invoices
 */
export async function getUserInvoices(userId: string, limit = 50, offset = 0) {
	return await db
		.selectFrom("invoices")
		.selectAll()
		.where("user_id", "=", userId)
		.orderBy("created_at", "desc")
		.limit(limit)
		.offset(offset)
		.execute();
}

/**
 * Get a specific invoice
 */
export async function getInvoice(invoiceId: string, userId: string) {
	return await db
		.selectFrom("invoices")
		.selectAll()
		.where("id", "=", invoiceId)
		.where("user_id", "=", userId)
		.executeTakeFirst();
}

/**
 * Get invoice line items
 */
export async function getInvoiceLineItems(invoiceId: string) {
	return await db
		.selectFrom("invoice_line_items")
		.selectAll()
		.where("invoice_id", "=", invoiceId)
		.execute();
}

/**
 * Create an invoice
 */
export async function createInvoice(data: {
	userId: string;
	invoiceNumber: string;
	subscriptionTier: string;
	billingPeriodStart: Date;
	billingPeriodEnd: Date;
	subtotal: number;
	taxAmount?: number;
	discountAmount?: number;
	totalAmount: number;
	currency?: string;
	status: string;
	dueDate?: Date;
	paymentProvider?: string;
	paymentProviderInvoiceId?: string;
	couponCode?: string;
	couponDescription?: string;
	metadata?: Record<string, unknown>;
}) {
	return await db
		.insertInto("invoices")
		.values({
			user_id: data.userId,
			invoice_number: data.invoiceNumber,
			subscription_tier: data.subscriptionTier,
			billing_period_start: data.billingPeriodStart.toISOString(),
			billing_period_end: data.billingPeriodEnd.toISOString(),
			subtotal: data.subtotal.toString(),
			tax_amount: (data.taxAmount || 0).toString(),
			discount_amount: (data.discountAmount || 0).toString(),
			total_amount: data.totalAmount.toString(),
			currency: data.currency || "USD",
			status: data.status,
			due_date: data.dueDate?.toISOString(),
			payment_provider: data.paymentProvider,
			payment_provider_invoice_id: data.paymentProviderInvoiceId,
			coupon_code: data.couponCode,
			coupon_description: data.couponDescription,
			metadata: data.metadata ? JSON.stringify(data.metadata) : null,
		})
		.returningAll()
		.executeTakeFirst();
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
	invoiceId: string,
	status: string,
	paidAt?: Date,
) {
	return await db
		.updateTable("invoices")
		.set({
			status,
			paid_at: paidAt?.toISOString(),
			updated_at: new Date().toISOString(),
		})
		.where("id", "=", invoiceId)
		.returningAll()
		.executeTakeFirst();
}

/**
 * Add line items to an invoice
 */
export async function addInvoiceLineItems(
	invoiceId: string,
	items: Array<{
		description: string;
		quantity: number;
		unitAmount: number;
		amount: number;
		currency?: string;
		periodStart?: Date;
		periodEnd?: Date;
		metadata?: Record<string, unknown>;
	}>,
) {
	const values = items.map((item) => ({
		invoice_id: invoiceId,
		description: item.description,
		quantity: item.quantity,
		unit_amount: item.unitAmount.toString(),
		amount: item.amount.toString(),
		currency: item.currency || "USD",
		period_start: item.periodStart?.toISOString(),
		period_end: item.periodEnd?.toISOString(),
		metadata: item.metadata ? JSON.stringify(item.metadata) : null,
	}));

	return await db.insertInto("invoice_line_items").values(values).execute();
}
