import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import {
	getBillingDetails,
	upsertBillingDetails,
} from "~/lib/db/queries/billing";

const updateBillingDetailsSchema = z.object({
	billingName: z.string().optional(),
	billingEmail: z.string().email().optional(),
	billingAddressLine1: z.string().optional(),
	billingAddressLine2: z.string().optional(),
	billingCity: z.string().optional(),
	billingState: z.string().optional(),
	billingPostalCode: z.string().optional(),
	billingCountry: z.string().length(2).optional(), // ISO 3166-1 alpha-2
	taxId: z.string().optional(),
	taxIdType: z.string().optional(),
});

export const Route = createFileRoute("/api/billing/details")({
	server: {
		handlers: {
			// Get user's billing details
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const details = await getBillingDetails(session.userId);

					// Don't expose sensitive payment provider IDs
					if (details) {
						return json({
							billingName: details.billing_name,
							billingEmail: details.billing_email,
							billingAddressLine1: details.billing_address_line1,
							billingAddressLine2: details.billing_address_line2,
							billingCity: details.billing_city,
							billingState: details.billing_state,
							billingPostalCode: details.billing_postal_code,
							billingCountry: details.billing_country,
							taxId: details.tax_id,
							taxIdType: details.tax_id_type,
							cardBrand: details.card_brand,
							cardLast4: details.card_last4,
							cardExpMonth: details.card_exp_month,
							cardExpYear: details.card_exp_year,
							paymentProvider: details.payment_provider,
							createdAt: details.created_at,
							updatedAt: details.updated_at,
						});
					}

					return json(null);
				} catch (error) {
					console.error("Billing details fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},

			// Update user's billing details
			PATCH: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const body = await request.json();
					const result = updateBillingDetailsSchema.safeParse(body);

					if (!result.success) {
						return json(
							{ error: "Invalid input", details: result.error.errors },
							{ status: 400 },
						);
					}

					const updated = await upsertBillingDetails(
						session.userId,
						result.data,
					);

					if (!updated) {
						return json(
							{ error: "Failed to update billing details" },
							{ status: 500 },
						);
					}

					return json({
						billingName: updated.billing_name,
						billingEmail: updated.billing_email,
						billingAddressLine1: updated.billing_address_line1,
						billingAddressLine2: updated.billing_address_line2,
						billingCity: updated.billing_city,
						billingState: updated.billing_state,
						billingPostalCode: updated.billing_postal_code,
						billingCountry: updated.billing_country,
						taxId: updated.tax_id,
						taxIdType: updated.tax_id_type,
					});
				} catch (error) {
					console.error("Billing details update error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
