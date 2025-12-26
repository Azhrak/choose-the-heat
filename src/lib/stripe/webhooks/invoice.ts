import type Stripe from "stripe";
import { db } from "~/lib/db";
import {
	addInvoiceLineItems,
	createInvoice,
	updateInvoiceStatus,
} from "~/lib/db/queries/billing";
import type { SubscriptionTier } from "~/lib/db/types";
import { getUserIdFromCustomerId } from "./utils";

// Helper type for webhook Invoice data which may have expanded fields
type WebhookInvoice = Stripe.Invoice & {
	subscription?: string | Stripe.Subscription;
	charge?: string | Stripe.Charge;
	payment_intent?: string | Stripe.PaymentIntent;
};

/**
 * Handle invoice.created event
 * Create a new invoice record in our database
 */
export async function handleInvoiceCreated(invoice: WebhookInvoice) {
	// Get user ID from Stripe customer ID
	const userId = await getUserIdFromCustomerId(invoice.customer as string);

	if (!userId) {
		console.error(
			`[Invoice Created] User not found for customer ${invoice.customer}`,
		);
		return;
	}

	// Determine subscription tier from line items
	const tierMetadata = invoice.lines.data[0]?.metadata?.tier;
	const subscriptionTier = (tierMetadata || "free") as SubscriptionTier;

	// Calculate amounts
	const subtotal = (invoice.subtotal ?? 0) / 100; // Convert from cents
	const taxAmount = (invoice.total_taxes?.[0]?.amount || 0) / 100;
	const discountAmount =
		(invoice.total_discount_amounts?.[0]?.amount || 0) / 100;
	const totalAmount = (invoice.total ?? 0) / 100;

	// Extract discount/coupon info safely
	const firstDiscount = invoice.discounts?.[0];
	const discountCoupon =
		typeof firstDiscount === "object" &&
		firstDiscount !== null &&
		"coupon" in firstDiscount
			? firstDiscount.coupon
			: null;
	const couponCode =
		typeof discountCoupon === "object" &&
		discountCoupon !== null &&
		"id" in discountCoupon
			? String(discountCoupon.id)
			: undefined;
	const couponDescription =
		typeof discountCoupon === "object" &&
		discountCoupon !== null &&
		"name" in discountCoupon
			? String(discountCoupon.name)
			: undefined;

	// Create invoice in database
	const createdInvoice = await createInvoice({
		userId,
		invoiceNumber: invoice.number || `DRAFT-${invoice.id}`,
		subscriptionTier,
		billingPeriodStart: new Date(invoice.period_start * 1000),
		billingPeriodEnd: new Date(invoice.period_end * 1000),
		subtotal,
		taxAmount,
		discountAmount,
		totalAmount,
		currency: invoice.currency.toUpperCase(),
		status: invoice.status || "draft",
		dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
		paymentProvider: "stripe",
		paymentProviderInvoiceId: invoice.id,
		couponCode,
		couponDescription,
		metadata: {
			stripe_invoice: invoice.id,
			subscription_id:
				typeof invoice.subscription === "string"
					? invoice.subscription
					: invoice.subscription?.id,
		},
	});

	if (!createdInvoice) {
		console.error(
			`[Invoice Created] Failed to create invoice for ${invoice.id}`,
		);
		return;
	}

	// Add line items
	const lineItems = invoice.lines.data.map((line) => {
		const lineWithPrice = line as Stripe.InvoiceLineItem & {
			price?: Stripe.Price;
		};
		return {
			description: line.description || "Subscription",
			quantity: line.quantity || 1,
			unitAmount: (lineWithPrice.price?.unit_amount || 0) / 100,
			amount: line.amount / 100,
			currency: line.currency.toUpperCase(),
			periodStart: line.period?.start
				? new Date(line.period.start * 1000)
				: undefined,
			periodEnd: line.period?.end
				? new Date(line.period.end * 1000)
				: undefined,
			metadata: {
				stripe_line_item_id: line.id,
				price_id: lineWithPrice.price?.id,
			},
		};
	});

	await addInvoiceLineItems(createdInvoice.id, lineItems);

	console.log(
		`[Invoice Created] Created invoice ${createdInvoice.invoice_number} for user ${userId}`,
	);
}

/**
 * Handle invoice.finalized event
 * Update invoice status to 'open' when finalized
 */
export async function handleInvoiceFinalized(invoice: WebhookInvoice) {
	// Find invoice by payment_provider_invoice_id
	const existingInvoice = await db
		.selectFrom("invoices")
		.selectAll()
		.where("payment_provider_invoice_id", "=", invoice.id)
		.executeTakeFirst();

	if (!existingInvoice) {
		console.error(
			`[Invoice Finalized] Invoice not found for Stripe invoice ${invoice.id}`,
		);
		return;
	}

	// Update invoice with finalized details
	await db
		.updateTable("invoices")
		.set({
			invoice_number: invoice.number || existingInvoice.invoice_number,
			status: "open",
			hosted_invoice_url: invoice.hosted_invoice_url,
			pdf_url: invoice.invoice_pdf,
			updated_at: new Date().toISOString(),
		})
		.where("id", "=", existingInvoice.id)
		.execute();

	console.log(
		`[Invoice Finalized] Updated invoice ${existingInvoice.invoice_number} to open`,
	);
}

/**
 * Handle invoice.paid event
 * Update invoice status to 'paid' and record payment details
 */
export async function handleInvoicePaid(invoice: WebhookInvoice) {
	// Find invoice by payment_provider_invoice_id
	const existingInvoice = await db
		.selectFrom("invoices")
		.selectAll()
		.where("payment_provider_invoice_id", "=", invoice.id)
		.executeTakeFirst();

	if (!existingInvoice) {
		console.error(
			`[Invoice Paid] Invoice not found for Stripe invoice ${invoice.id}`,
		);
		return;
	}

	// Extract payment details
	const paymentIntentId =
		typeof invoice.payment_intent === "string"
			? invoice.payment_intent
			: invoice.payment_intent?.id;
	const charge =
		typeof invoice.charge === "object" ? invoice.charge : undefined;

	// Update invoice to paid status
	await db
		.updateTable("invoices")
		.set({
			status: "paid",
			paid_at: new Date().toISOString(),
			payment_intent_id: paymentIntentId || null,
			payment_method: charge?.payment_method_details?.type || "card",
			card_last4: charge?.payment_method_details?.card?.last4 || null,
			hosted_invoice_url: invoice.hosted_invoice_url,
			pdf_url: invoice.invoice_pdf,
			updated_at: new Date().toISOString(),
		})
		.where("id", "=", existingInvoice.id)
		.execute();

	// Create transaction record
	const subscriptionId =
		typeof invoice.subscription === "string"
			? invoice.subscription
			: invoice.subscription?.id;

	await db
		.insertInto("subscription_transactions")
		.values({
			user_id: existingInvoice.user_id,
			tier: existingInvoice.subscription_tier,
			amount: existingInvoice.total_amount,
			currency: existingInvoice.currency,
			payment_provider: "stripe",
			payment_provider_id: paymentIntentId || invoice.id,
			status: "completed",
			metadata: JSON.stringify({
				invoice_id: existingInvoice.id,
				invoice_number: existingInvoice.invoice_number,
				stripe_invoice_id: invoice.id,
				subscription_id: subscriptionId,
				description: `Payment for ${existingInvoice.invoice_number}`,
			}),
		})
		.execute();

	console.log(
		`[Invoice Paid] Marked invoice ${existingInvoice.invoice_number} as paid`,
	);
}

/**
 * Handle invoice.payment_failed event
 * Update invoice status to 'failed'
 */
export async function handleInvoicePaymentFailed(invoice: WebhookInvoice) {
	// Find invoice by payment_provider_invoice_id
	const existingInvoice = await db
		.selectFrom("invoices")
		.selectAll()
		.where("payment_provider_invoice_id", "=", invoice.id)
		.executeTakeFirst();

	if (!existingInvoice) {
		console.error(
			`[Invoice Payment Failed] Invoice not found for Stripe invoice ${invoice.id}`,
		);
		return;
	}

	// Update invoice to failed status
	await db
		.updateTable("invoices")
		.set({
			status: "failed",
			updated_at: new Date().toISOString(),
			metadata: JSON.stringify({
				...((existingInvoice.metadata as Record<string, unknown>) || {}),
				last_payment_error: invoice.last_finalization_error?.message,
				attempt_count: invoice.attempt_count,
			}),
		})
		.where("id", "=", existingInvoice.id)
		.execute();

	// Create failed transaction record
	const failedPaymentIntentId =
		typeof invoice.payment_intent === "string"
			? invoice.payment_intent
			: invoice.payment_intent?.id;

	await db
		.insertInto("subscription_transactions")
		.values({
			user_id: existingInvoice.user_id,
			tier: existingInvoice.subscription_tier,
			amount: existingInvoice.total_amount,
			currency: existingInvoice.currency,
			payment_provider: "stripe",
			payment_provider_id: failedPaymentIntentId || invoice.id,
			status: "failed",
			metadata: JSON.stringify({
				invoice_id: existingInvoice.id,
				invoice_number: existingInvoice.invoice_number,
				stripe_invoice_id: invoice.id,
				error: invoice.last_finalization_error?.message,
				description: `Failed payment for ${existingInvoice.invoice_number}`,
			}),
		})
		.execute();

	console.log(
		`[Invoice Payment Failed] Marked invoice ${existingInvoice.invoice_number} as failed`,
	);
}

/**
 * Handle invoice.voided event
 * Update invoice status to 'void'
 */
export async function handleInvoiceVoided(invoice: WebhookInvoice) {
	// Find invoice by payment_provider_invoice_id
	const existingInvoice = await db
		.selectFrom("invoices")
		.selectAll()
		.where("payment_provider_invoice_id", "=", invoice.id)
		.executeTakeFirst();

	if (!existingInvoice) {
		console.error(
			`[Invoice Voided] Invoice not found for Stripe invoice ${invoice.id}`,
		);
		return;
	}

	await updateInvoiceStatus(existingInvoice.id, "void");

	console.log(
		`[Invoice Voided] Marked invoice ${existingInvoice.invoice_number} as void`,
	);
}
