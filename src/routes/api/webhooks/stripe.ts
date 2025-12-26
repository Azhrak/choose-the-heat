import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type Stripe from "stripe";
import { stripe } from "~/lib/stripe/client";
import {
	handleCustomerDeleted,
	handleCustomerUpdated,
} from "~/lib/stripe/webhooks/customer";
import {
	handleInvoiceCreated,
	handleInvoiceFinalized,
	handleInvoicePaid,
	handleInvoicePaymentFailed,
	handleInvoiceVoided,
} from "~/lib/stripe/webhooks/invoice";
import {
	handleChargeFailed,
	handleChargeRefunded,
	handlePaymentMethodAttached,
	handlePaymentMethodDetached,
} from "~/lib/stripe/webhooks/payment";
import {
	handleSubscriptionCreated,
	handleSubscriptionDeleted,
	handleSubscriptionUpdated,
} from "~/lib/stripe/webhooks/subscription";
import {
	isEventProcessed,
	markEventProcessed,
	saveWebhookEvent,
} from "~/lib/stripe/webhooks/utils";

export const Route = createFileRoute("/api/webhooks/stripe")({
	server: {
		handlers: {
			// POST /api/webhooks/stripe - Handle Stripe webhook events
			POST: async ({ request }) => {
				try {
					// Get raw body for signature verification
					const body = await request.text();
					const signature = request.headers.get("stripe-signature");

					if (!signature) {
						console.error("[Webhook] No Stripe signature found");
						return json({ error: "No signature" }, { status: 400 });
					}

					// Verify webhook signature
					let event: Stripe.Event;
					try {
						event = stripe.webhooks.constructEvent(
							body,
							signature,
							process.env.STRIPE_WEBHOOK_SECRET || "",
						);
					} catch (err) {
						console.error("[Webhook] Signature verification failed:", err);
						return json({ error: "Invalid signature" }, { status: 400 });
					}

					// Check if event was already processed (idempotency)
					const alreadyProcessed = await isEventProcessed(event.id);
					if (alreadyProcessed) {
						console.log(
							`[Webhook] Event ${event.id} already processed, skipping`,
						);
						return json({ received: true, processed: false });
					}

					// Save event for idempotency tracking
					const saved = await saveWebhookEvent(
						event.id,
						event.type,
						event.data.object as unknown as Record<string, unknown>,
					);

					if (!saved) {
						// Event already exists (race condition)
						console.log(`[Webhook] Event ${event.id} already exists, skipping`);
						return json({ received: true, processed: false });
					}

					// Process event based on type
					try {
						await processWebhookEvent(event);
						await markEventProcessed(event.id);
						console.log(
							`[Webhook] Successfully processed event ${event.id} (${event.type})`,
						);
					} catch (error) {
						// Log error but still mark as processed to avoid infinite retries
						const errorMessage =
							error instanceof Error ? error.message : "Unknown error";
						console.error(
							`[Webhook] Error processing event ${event.id}:`,
							errorMessage,
						);
						await markEventProcessed(event.id, errorMessage);
					}

					// Always return 200 to Stripe
					return json({ received: true, processed: true });
				} catch (error) {
					console.error("[Webhook] Unexpected error:", error);
					// Still return 200 to prevent Stripe from retrying
					return json({ received: true, error: "Internal error" });
				}
			},
		},
	},
});

/**
 * Route webhook event to appropriate handler
 */
async function processWebhookEvent(event: Stripe.Event): Promise<void> {
	switch (event.type) {
		// Invoice events
		case "invoice.created":
			await handleInvoiceCreated(event.data.object as Stripe.Invoice);
			break;
		case "invoice.finalized":
			await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
			break;
		case "invoice.paid":
			await handleInvoicePaid(event.data.object as Stripe.Invoice);
			break;
		case "invoice.payment_failed":
			await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
			break;
		case "invoice.voided":
			await handleInvoiceVoided(event.data.object as Stripe.Invoice);
			break;

		// Subscription events
		case "customer.subscription.created":
			await handleSubscriptionCreated(
				event.data.object as Stripe.Subscription & {
					current_period_start: number;
					current_period_end: number;
				},
			);
			break;
		case "customer.subscription.updated":
			await handleSubscriptionUpdated(
				event.data.object as Stripe.Subscription & {
					current_period_start: number;
					current_period_end: number;
				},
			);
			break;
		case "customer.subscription.deleted":
			await handleSubscriptionDeleted(
				event.data.object as Stripe.Subscription & {
					current_period_start: number;
					current_period_end: number;
				},
			);
			break;

		// Customer events
		case "customer.updated":
			await handleCustomerUpdated(event.data.object as Stripe.Customer);
			break;
		case "customer.deleted":
			await handleCustomerDeleted(event.data.object as Stripe.Customer);
			break;

		// Payment method events
		case "payment_method.attached":
			await handlePaymentMethodAttached(
				event.data.object as Stripe.PaymentMethod,
			);
			break;
		case "payment_method.detached":
			await handlePaymentMethodDetached(
				event.data.object as Stripe.PaymentMethod,
			);
			break;

		// Charge events
		case "charge.refunded":
			await handleChargeRefunded(event.data.object as Stripe.Charge);
			break;
		case "charge.failed":
			await handleChargeFailed(event.data.object as Stripe.Charge);
			break;

		default:
			console.log(`[Webhook] Unhandled event type: ${event.type}`);
	}
}
