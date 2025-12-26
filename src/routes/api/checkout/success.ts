import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAuth } from "~/lib/auth/authorization";
import { stripe } from "~/lib/stripe/client";

export const Route = createFileRoute("/api/checkout/success")({
	server: {
		handlers: {
			// GET /api/checkout/success?session_id=xxx - Verify checkout session
			GET: async ({ request }) => {
				try {
					// Require authentication
					const { userId } = await requireAuth(request);

					// Get session ID from query params
					const url = new URL(request.url);
					const sessionId = url.searchParams.get("session_id");

					if (!sessionId) {
						return json(
							{ error: "Missing session_id parameter" },
							{ status: 400 },
						);
					}

					// Retrieve session from Stripe
					const session = await stripe.checkout.sessions.retrieve(sessionId, {
						expand: ["subscription", "customer"],
					});

					// Verify session belongs to the authenticated user
					if (session.metadata?.user_id !== userId) {
						return json(
							{ error: "Session does not belong to current user" },
							{ status: 403 },
						);
					}

					// Return session status
					return json({
						status: session.status,
						paymentStatus: session.payment_status,
						customerEmail: session.customer_details?.email,
						amountTotal: session.amount_total ? session.amount_total / 100 : 0,
						currency: session.currency,
						subscriptionId: session.subscription,
						metadata: session.metadata,
					});
				} catch (error) {
					console.error("[Checkout Success] Error verifying session:", error);

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
									: "Failed to verify checkout session",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
