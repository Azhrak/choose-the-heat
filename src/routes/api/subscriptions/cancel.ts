import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAuth } from "~/lib/auth/authorization";
import { db } from "~/lib/db";
import { stripe } from "~/lib/stripe/client";

export const Route = createFileRoute("/api/subscriptions/cancel")({
	server: {
		handlers: {
			// POST /api/subscriptions/cancel - Cancel user's subscription
			POST: async ({ request }) => {
				try {
					// Require authentication
					const { userId } = await requireAuth(request);

					// Get user's subscription
					const user = await db
						.selectFrom("users")
						.select([
							"id",
							"stripe_subscription_id",
							"subscription_tier",
							"subscription_end_date",
						])
						.where("id", "=", userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					// Check if user has an active subscription
					if (!user.stripe_subscription_id) {
						return json(
							{ error: "No active subscription to cancel" },
							{ status: 400 },
						);
					}

					if (user.subscription_tier === "free") {
						return json({ error: "Cannot cancel free tier" }, { status: 400 });
					}

					// Cancel subscription in Stripe (at period end)
					const subscription = await stripe.subscriptions.update(
						user.stripe_subscription_id,
						{
							cancel_at_period_end: true,
						},
					);

					// Database will be updated via webhook
					// Return success with subscription end date
					// Note: current_period_end exists in the actual Stripe response
					const webhookSub = subscription as typeof subscription & {
						current_period_end: number;
					};
					return json({
						success: true,
						message:
							"Subscription will be canceled at the end of the billing period",
						endsAt: webhookSub.current_period_end,
						endsAtDate: new Date(webhookSub.current_period_end * 1000),
					});
				} catch (error) {
					console.error("[Cancel Subscription] Error:", error);

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
									: "Failed to cancel subscription",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
