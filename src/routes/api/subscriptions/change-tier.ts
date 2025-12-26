import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "~/lib/auth/authorization";
import { db } from "~/lib/db";
import type { SubscriptionTier } from "~/lib/db/types";
import { stripe } from "~/lib/stripe/client";

// Request body validation schema
const ChangeTierSchema = z.object({
	tierId: z.enum(["basic", "premium", "premium_plus"]),
	billingPeriod: z.enum(["monthly", "yearly"]),
});

export const Route = createFileRoute("/api/subscriptions/change-tier")({
	server: {
		handlers: {
			// POST /api/subscriptions/change-tier - Change subscription tier
			POST: async ({ request }) => {
				try {
					// Require authentication
					const { userId } = await requireAuth(request);

					// Parse and validate request body
					const body = await request.json();
					const validation = ChangeTierSchema.safeParse(body);

					if (!validation.success) {
						return json(
							{ error: "Invalid request body", details: validation.error },
							{ status: 400 },
						);
					}

					const { tierId, billingPeriod } = validation.data;

					// Get user's current subscription
					const user = await db
						.selectFrom("users")
						.select(["id", "stripe_subscription_id", "subscription_tier"])
						.where("id", "=", userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					// Check if user has an active subscription
					if (!user.stripe_subscription_id) {
						return json(
							{
								error:
									"No active subscription. Please create a new subscription instead.",
							},
							{ status: 400 },
						);
					}

					// Cannot change to same tier
					if (user.subscription_tier === tierId) {
						return json(
							{ error: "Already subscribed to this tier" },
							{ status: 400 },
						);
					}

					// Get new tier details from database
					const newTier = await db
						.selectFrom("subscription_tier_limits")
						.selectAll()
						.where("tier", "=", tierId as SubscriptionTier)
						.where("is_active", "=", true)
						.executeTakeFirst();

					if (!newTier) {
						return json(
							{ error: "Tier not found or inactive" },
							{ status: 404 },
						);
					}

					// Get price ID based on billing period
					const newPriceId =
						billingPeriod === "monthly"
							? newTier.stripe_price_id_monthly
							: newTier.stripe_price_id_yearly;

					if (!newPriceId) {
						return json(
							{
								error: `${billingPeriod} billing not available for this tier`,
							},
							{ status: 400 },
						);
					}

					// Get current subscription from Stripe
					const subscription = await stripe.subscriptions.retrieve(
						user.stripe_subscription_id,
					);

					// Update subscription in Stripe (automatically handles proration)
					const updatedSubscription = await stripe.subscriptions.update(
						user.stripe_subscription_id,
						{
							items: [
								{
									id: subscription.items.data[0].id,
									price: newPriceId,
								},
							],
							proration_behavior: "always_invoice", // Create invoice for proration
							metadata: {
								user_id: userId,
								tier: tierId,
							},
						},
					);

					// Database will be updated via webhook
					return json({
						success: true,
						message: "Subscription tier updated successfully",
						subscriptionId: updatedSubscription.id,
						newTier: tierId,
						billingPeriod,
						proratedAmount: updatedSubscription.latest_invoice
							? (updatedSubscription.latest_invoice as { amount_due: number })
									.amount_due / 100
							: 0,
					});
				} catch (error) {
					console.error("[Change Tier] Error:", error);

					// Handle specific Stripe errors
					if (error && typeof error === "object" && "type" in error) {
						const stripeError = error as { type: string; message: string };
						return json(
							{ error: `Stripe error: ${stripeError.message}` },
							{ status: 500 },
						);
					}

					return json(
						{
							error:
								error instanceof Error
									? error.message
									: "Failed to change subscription tier",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
