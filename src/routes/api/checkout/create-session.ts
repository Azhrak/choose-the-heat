import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "~/lib/auth/authorization";
import { db } from "~/lib/db";
import type { SubscriptionTier } from "~/lib/db/types";
import { stripe } from "~/lib/stripe/client";
import { getOrCreateStripeCustomer } from "~/lib/stripe/customers";

// Request body validation schema
const CreateSessionSchema = z.object({
	tierId: z.enum(["free", "basic", "premium", "premium_plus"]),
	billingPeriod: z.enum(["monthly", "yearly"]),
});

export const Route = createFileRoute("/api/checkout/create-session")({
	server: {
		handlers: {
			// POST /api/checkout/create-session - Create Stripe Checkout session
			POST: async ({ request }) => {
				try {
					// Require authentication
					const { userId } = await requireAuth(request);

					// Parse and validate request body
					const body = await request.json();
					const validation = CreateSessionSchema.safeParse(body);

					if (!validation.success) {
						return json(
							{ error: "Invalid request body", details: validation.error },
							{ status: 400 },
						);
					}

					const { tierId, billingPeriod } = validation.data;

					// Cannot create checkout for free tier
					if (tierId === "free") {
						return json(
							{ error: "Cannot create checkout session for free tier" },
							{ status: 400 },
						);
					}

					// Get tier details from database
					const tier = await db
						.selectFrom("subscription_tier_limits")
						.selectAll()
						.where("tier", "=", tierId as SubscriptionTier)
						.where("is_active", "=", true)
						.executeTakeFirst();

					if (!tier) {
						return json(
							{ error: "Tier not found or inactive" },
							{ status: 404 },
						);
					}

					// Get price ID based on billing period
					const priceId =
						billingPeriod === "monthly"
							? tier.stripe_price_id_monthly
							: tier.stripe_price_id_yearly;

					if (!priceId) {
						return json(
							{
								error: `${billingPeriod} billing not available for this tier`,
							},
							{ status: 400 },
						);
					}

					// Get user details for customer creation
					const user = await db
						.selectFrom("users")
						.select(["id", "email", "name", "stripe_customer_id"])
						.where("id", "=", userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					// Get or create Stripe customer
					const stripeCustomer = await getOrCreateStripeCustomer(
						user.id,
						user.email,
						user.name || undefined,
					);

					// Create Checkout Session
					const session = await stripe.checkout.sessions.create({
						customer: stripeCustomer.id,
						mode: "subscription",
						payment_method_types: ["card"],
						line_items: [
							{
								price: priceId,
								quantity: 1,
							},
						],
						success_url: `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
						cancel_url: `${process.env.APP_URL}/subscription`,
						allow_promotion_codes: true,
						billing_address_collection: "auto",
						metadata: {
							user_id: userId,
							tier: tierId,
							billing_period: billingPeriod,
						},
						subscription_data: {
							metadata: {
								user_id: userId,
								tier: tierId,
							},
						},
					});

					// Return session URL
					return json({
						sessionId: session.id,
						sessionUrl: session.url,
					});
				} catch (error) {
					console.error("[Checkout] Error creating session:", error);

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
									: "Failed to create checkout session",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
